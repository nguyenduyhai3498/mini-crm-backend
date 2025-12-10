import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, TenantPermission } from '../common/enums/role.enum';
import { SendEmailDto } from './dto/send-email.dto';
import { ReplyEmailDto } from './dto/reply-email.dto';
import { User } from '../entities/user.entity';
import { TenantService } from '../tenant/tenant.service';

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly tenantService: TenantService,
  ) {}

  @Post('send')
  @Permissions(TenantPermission.SEND_EMAILS)
  async sendEmail(@CurrentUser() user: User, @Body() sendEmailDto: SendEmailDto) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    // Check if user has permission to send emails from this account
    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      sendEmailDto.socialPageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to send emails from this account',
      );
    }

    return this.emailService.sendEmail(user.tenantId, sendEmailDto);
  }

  @Post('reply')
  @Permissions(TenantPermission.SEND_EMAILS)
  async replyToEmail(
    @CurrentUser() user: User,
    @Body() replyEmailDto: ReplyEmailDto,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      replyEmailDto.socialPageId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to send emails from this account',
      );
    }

    return this.emailService.replyToEmail(user.tenantId, replyEmailDto);
  }

  @Get('account/:accountId')
  @Permissions(TenantPermission.SEND_EMAILS, TenantPermission.VIEW_MESSAGES)
  async getEmails(
    @CurrentUser() user: User,
    @Param('accountId') accountId: string,
    @Query('maxResults', ParseIntPipe) maxResults: number = 25,
    @Query('after') after?: string,
    @Query('before') before?: string,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      accountId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view emails from this account',
      );
    }

    return this.emailService.getEmails(
      user.tenantId,
      accountId,
      maxResults,
      after ? new Date(after) : undefined,
      before ? new Date(before) : undefined,
    );
  }

  @Get('account/:accountId/message/:messageId')
  @Permissions(TenantPermission.SEND_EMAILS, TenantPermission.VIEW_MESSAGES)
  async getEmailById(
    @CurrentUser() user: User,
    @Param('accountId') accountId: string,
    @Param('messageId') messageId: string,
  ) {
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with a tenant');
    }

    const hasPermission = await this.tenantService.checkUserPagePermission(
      user.id,
      accountId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view emails from this account',
      );
    }

    return this.emailService.getEmailById(user.tenantId, accountId, messageId);
  }
}






