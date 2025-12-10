import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Message } from '../entities/message.entity';
import { SocialPage } from '../entities/social-page.entity';
import { FacebookService } from '../social/services/facebook.service';
import { GmailService } from '../social/services/gmail.service';
import { SocialPlatform } from '../common/enums/social-platform.enum';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(SocialPage)
    private socialPageRepository: Repository<SocialPage>,
    private facebookService: FacebookService,
    private gmailService: GmailService,
  ) {}

  async getMessages(
    tenantId: string,
    socialPageId: string,
    query: GetMessagesQueryDto,
  ): Promise<Message[]> {
    const page = await this.socialPageRepository.findOne({
      where: { id: socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    // If refresh is requested, fetch fresh data from social platform
    if (query.refresh) {
      await this.syncMessagesFromPlatform(page, query.since, query.until);
    }

    // Build query conditions
    const where: any = { socialPageId };

    if (query.conversationId) {
      where.conversationId = query.conversationId;
    }

    if (query.since || query.until) {
      where.sentAt = Between(
        query.since ? new Date(query.since) : new Date(0),
        query.until ? new Date(query.until) : new Date(),
      );
    }

    return this.messageRepository.find({
      where,
      order: { sentAt: 'DESC' },
      take: query.limit || 25,
    });
  }

  async getConversations(
    tenantId: string,
    socialPageId: string,
  ): Promise<any[]> {
    const page = await this.socialPageRepository.findOne({
      where: { id: socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    // Get unique conversations with latest message
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.conversationId', 'conversationId')
      .addSelect('MAX(message.sentAt)', 'lastMessageAt')
      .addSelect('COUNT(*)', 'messageCount')
      .addSelect(
        'SUM(CASE WHEN message.isRead = false THEN 1 ELSE 0 END)',
        'unreadCount',
      )
      .where('message.socialPageId = :socialPageId', { socialPageId })
      .groupBy('message.conversationId')
      .orderBy('lastMessageAt', 'DESC')
      .getRawMany();

    // Get the last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepository.findOne({
          where: {
            socialPageId,
            conversationId: conv.conversationId,
          },
          order: { sentAt: 'DESC' },
        });

        return {
          conversationId: conv.conversationId,
          lastMessageAt: conv.lastMessageAt,
          messageCount: parseInt(conv.messageCount),
          unreadCount: parseInt(conv.unreadCount),
          lastMessage,
        };
      }),
    );

    return conversationsWithMessages;
  }

  async sendMessage(
    tenantId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<any> {
    const page = await this.socialPageRepository.findOne({
      where: { id: sendMessageDto.socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Social page not found');
    }

    try {
      let result;

      if (page.platform === SocialPlatform.FACEBOOK) {
        result = await this.facebookService.sendMessage(
          page.pageId,
          page.accessToken,
          sendMessageDto.recipientId,
          sendMessageDto.content,
        );
      } else if (page.platform === SocialPlatform.GMAIL) {
        // For Gmail, recipientId should be an email address
        // Extract subject from content or use default
        const subject = 'Message from ' + page.name;
        result = await this.gmailService.sendMessage(
          page.accessToken,
          sendMessageDto.recipientId,
          subject,
          sendMessageDto.content,
        );
      } else {
        throw new BadRequestException(
          'Messaging not supported for this platform',
        );
      }

      // Save sent message to database
      const message = this.messageRepository.create({
        externalId: result.message_id || result.id,
        conversationId: result.recipient_id || sendMessageDto.recipientId,
        socialPageId: page.id,
        platform: page.platform,
        content: sendMessageDto.content,
        senderId: page.pageId,
        senderName: page.name,
        isFromPage: true,
        isRead: true,
        sentAt: new Date(),
      });

      await this.messageRepository.save(message);

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      throw new BadRequestException(
        `Failed to send message: ${error.message}`,
      );
    }
  }

  async markAsRead(
    tenantId: string,
    socialPageId: string,
    messageId: string,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, socialPageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    await this.messageRepository.save(message);
  }

  async markConversationAsRead(
    tenantId: string,
    socialPageId: string,
    conversationId: string,
  ): Promise<void> {
    await this.messageRepository.update(
      { socialPageId, conversationId, isRead: false },
      { isRead: true },
    );
  }

  private async syncMessagesFromPlatform(
    page: SocialPage,
    since?: string,
    until?: string,
  ): Promise<void> {
    try {
      const sinceDate = since ? new Date(since) : undefined;
      const untilDate = until ? new Date(until) : undefined;

      if (page.platform === SocialPlatform.FACEBOOK) {
        // Get conversations
        const conversations = await this.facebookService.getConversations(
          page.pageId,
          page.accessToken,
        );

        for (const conversation of conversations) {
          // Get messages for each conversation
          const fbMessages = await this.facebookService.getMessages(
            conversation.id,
            page.accessToken,
          );

          for (const fbMessage of fbMessages) {
            const existingMessage = await this.messageRepository.findOne({
              where: { externalId: fbMessage.id },
            });

            const messageData = {
              externalId: fbMessage.id,
              conversationId: conversation.id,
              socialPageId: page.id,
              platform: page.platform,
              content: fbMessage.message,
              senderId: fbMessage.from.id,
              senderName: fbMessage.from.name,
              isFromPage: fbMessage.from.id === page.pageId,
              isRead: false,
              sentAt: new Date(fbMessage.created_time),
              metadata: fbMessage,
            };

            if (existingMessage) {
              Object.assign(existingMessage, messageData);
              await this.messageRepository.save(existingMessage);
            } else {
              const message = this.messageRepository.create(messageData);
              await this.messageRepository.save(message);
            }
          }
        }
      } else if (page.platform === SocialPlatform.GMAIL) {
        const gmailMessages = await this.gmailService.getMessages(
          page.accessToken,
          25,
          sinceDate,
          untilDate,
        );

        for (const gmailMessage of gmailMessages) {
          const existingMessage = await this.messageRepository.findOne({
            where: { externalId: gmailMessage.id },
          });

          const messageData = {
            externalId: gmailMessage.id,
            conversationId: gmailMessage.threadId,
            socialPageId: page.id,
            platform: page.platform,
            content: gmailMessage.snippet || gmailMessage.body || '',
            senderId: gmailMessage.from,
            senderName: gmailMessage.from,
            isFromPage: false, // Assume incoming messages
            isRead: false,
            sentAt: new Date(parseInt(gmailMessage.internalDate)),
            metadata: gmailMessage,
          };

          if (existingMessage) {
            Object.assign(existingMessage, messageData);
            await this.messageRepository.save(existingMessage);
          } else {
            const message = this.messageRepository.create(messageData);
            await this.messageRepository.save(message);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing messages:', error.message);
      throw new BadRequestException(
        `Failed to sync messages: ${error.message}`,
      );
    }
  }
}






