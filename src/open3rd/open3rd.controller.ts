import { Controller, Get, Query } from '@nestjs/common';
import { Open3rdService } from './open3rd.service';

@Controller('open3rd')
export class Open3rdController {
    constructor(private readonly open3rdService: Open3rdService) {}

    @Get('settings')
    async getSettings(@Query('tenantId') tenantId: string) {
        return this.open3rdService.getSettings(tenantId);
    }
}