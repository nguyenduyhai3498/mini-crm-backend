import { Controller, Get, Query } from '@nestjs/common';
import { Open3rdService } from './open3rd.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('open3rd')
export class Open3rdController {
    constructor(private readonly open3rdService: Open3rdService) {}

    @Public()
    @Get('settings')
    async getSettings(@Query('tenantId') tenantId: string) {
        return this.open3rdService.getSettings(tenantId);
    }
}