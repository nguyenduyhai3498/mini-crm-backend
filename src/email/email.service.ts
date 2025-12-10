import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialPage } from '../entities/social-page.entity';
import { GmailService } from '../social/services/gmail.service';
import { SocialPlatform } from '../common/enums/social-platform.enum';
import { SendEmailDto } from './dto/send-email.dto';
import { ReplyEmailDto } from './dto/reply-email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(SocialPage)
    private socialPageRepository: Repository<SocialPage>,
    private gmailService: GmailService,
  ) {}

  async sendEmail(tenantId: string, sendEmailDto: SendEmailDto): Promise<any> {
    const page = await this.socialPageRepository.findOne({
      where: { id: sendEmailDto.socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Gmail account not found');
    }

    if (page.platform !== SocialPlatform.GMAIL) {
      throw new BadRequestException('This is not a Gmail account');
    }

    try {
      const result = await this.gmailService.sendMessage(
        page.accessToken,
        sendEmailDto.to,
        sendEmailDto.subject,
        sendEmailDto.body,
        sendEmailDto.cc,
        sendEmailDto.bcc,
      );

      return {
        success: true,
        messageId: result.id,
        message: 'Email sent successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async replyToEmail(
    tenantId: string,
    replyEmailDto: ReplyEmailDto,
  ): Promise<any> {
    const page = await this.socialPageRepository.findOne({
      where: { id: replyEmailDto.socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Gmail account not found');
    }

    if (page.platform !== SocialPlatform.GMAIL) {
      throw new BadRequestException('This is not a Gmail account');
    }

    try {
      const result = await this.gmailService.replyToMessage(
        page.accessToken,
        replyEmailDto.threadId,
        replyEmailDto.messageId,
        replyEmailDto.body,
      );

      return {
        success: true,
        messageId: result.id,
        message: 'Reply sent successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to send reply: ${error.message}`,
      );
    }
  }

  async getEmails(
    tenantId: string,
    socialPageId: string,
    maxResults: number = 25,
    after?: Date,
    before?: Date,
  ): Promise<any[]> {
    const page = await this.socialPageRepository.findOne({
      where: { id: socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Gmail account not found');
    }

    if (page.platform !== SocialPlatform.GMAIL) {
      throw new BadRequestException('This is not a Gmail account');
    }

    try {
      return await this.gmailService.getMessages(
        page.accessToken,
        maxResults,
        after,
        before,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch emails: ${error.message}`,
      );
    }
  }

  async getEmailById(
    tenantId: string,
    socialPageId: string,
    messageId: string,
  ): Promise<any> {
    const page = await this.socialPageRepository.findOne({
      where: { id: socialPageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Gmail account not found');
    }

    if (page.platform !== SocialPlatform.GMAIL) {
      throw new BadRequestException('This is not a Gmail account');
    }

    try {
      return await this.gmailService.getMessageById(
        page.accessToken,
        messageId,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to fetch email: ${error.message}`);
    }
  }
}






