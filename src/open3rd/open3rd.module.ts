import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPage } from '../entities/social-page.entity';
import { Tenant } from '../entities/tenant.entity';
import { TenantSettings } from '../entities/tenant-settings.entity';
import { Open3rdController } from './open3rd.controller';
import { Open3rdService } from './open3rd.service';

@Module({
    imports: [TypeOrmModule.forFeature([SocialPage, Tenant, TenantSettings])],
    controllers: [Open3rdController],
    providers: [Open3rdService],
    exports: [Open3rdService],
})
export class Open3rdModule{};