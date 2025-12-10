import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SocialPage } from '../entities/social-page.entity';
import { SocialModule } from '../social/social.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([SocialPage]), SocialModule, TenantModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}






