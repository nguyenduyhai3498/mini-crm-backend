import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialPage } from '../entities/social-page.entity';
import { Tenant } from '../entities/tenant.entity';
import {TenantSettings} from '../entities/tenant-settings.entity';


@Injectable()
export class Open3rdService {
    constructor(
        @InjectRepository(SocialPage)
        private socialPageRepository: Repository<SocialPage>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        @InjectRepository(TenantSettings)
        private tenantSettingsRepository: Repository<TenantSettings>,
    ) {}


    async getSettings(tenantId: string) {
        const tenantSettings = await this.tenantSettingsRepository.findOne({
            where: { 
                tenant: { id: tenantId },
            },
        });
        return {
            statusCode: 200,
            brandSettings: tenantSettings?.brandSettings || {},
            systemSettings: tenantSettings?.systemSettings || {},
        };
    }
}