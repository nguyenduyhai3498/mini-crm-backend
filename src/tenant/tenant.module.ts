import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { SocialPage } from '../entities/social-page.entity';
import { TenantSettings } from '../entities/tenant-settings.entity';
import { AuthModule } from '../auth/auth.module';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant, SocialPage, TenantSettings]), AuthModule, SocialModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

