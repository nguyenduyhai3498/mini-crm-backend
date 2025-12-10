import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, TenantPermission } from '../common/enums/role.enum';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../entities/user.entity';
import { TenantService } from '../tenant/tenant.service';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly tenantService: TenantService,
  ) {}

  @Get('page/:pageId')
  @Permissions(TenantPermission.VIEW_MESSAGES)
  async getMessages(
    @CurrentUser() user: User,
    @Param('pageId') pageId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    // Check if user has permission to view messages from this page
    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      pageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view messages from this page',
      );
    }

    return this.messagesService.getMessages(user.tenantId, pageId, query);
  }

  @Get('page/:pageId/conversations')
  @Permissions(TenantPermission.VIEW_MESSAGES)
  async getConversations(
    @CurrentUser() user: User,
    @Param('pageId') pageId: string,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      pageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view conversations from this page',
      );
    }

    return this.messagesService.getConversations(user.tenantId, pageId);
  }

  @Post('send')
  @Permissions(TenantPermission.MANAGE_MESSAGES)
  async sendMessage(
    @CurrentUser() user: User,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      sendMessageDto.socialPageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to send messages from this page',
      );
    }

    return this.messagesService.sendMessage(user.tenantId, sendMessageDto);
  }

  @Put('page/:pageId/message/:messageId/read')
  @Permissions(TenantPermission.VIEW_MESSAGES)
  async markAsRead(
    @CurrentUser() user: User,
    @Param('pageId') pageId: string,
    @Param('messageId') messageId: string,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      pageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to manage messages from this page',
      );
    }

    await this.messagesService.markAsRead(user.tenantId, pageId, messageId);
    return { message: 'Message marked as read' };
  }

  @Put('page/:pageId/conversation/:conversationId/read')
  @Permissions(TenantPermission.VIEW_MESSAGES)
  async markConversationAsRead(
    @CurrentUser() user: User,
    @Param('pageId') pageId: string,
    @Param('conversationId') conversationId: string,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      pageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to manage messages from this page',
      );
    }

    await this.messagesService.markConversationAsRead(
      user.tenantId,
      pageId,
      conversationId,
    );
    return { message: 'Conversation marked as read' };
  }
}






