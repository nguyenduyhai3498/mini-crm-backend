import { Controller, Get, Query, Res } from '@nestjs/common';
import { Open3rdService } from './open3rd.service';
import { Public } from 'src/auth/decorators/public.decorator';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('open3rd')
export class Open3rdController {
    constructor(private readonly open3rdService: Open3rdService) {}

    @Public()
    @Get('settings')
    async getSettings(@Query('tenantId') tenantId: string) {
        return this.open3rdService.getSettings(tenantId);
    }

    @Get('facebook/redirect')
    @UseGuards(JwtAuthGuard)
    async facebookRedirect(@CurrentUser('tenantId') tenantId: string) {
        return this.open3rdService.facebookRedirect(tenantId);
    }   

    @Public()
    @Get('facebook/callback')
    async facebookCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        const urlRedirect = process.env.FE_APP_URL + '/';
        // window.location.href = urlRedirect;
        const response = await this.open3rdService.facebookCallback(code, state);
        // return res.redirect(response.urlRedirect);
        
        return res.redirect(urlRedirect);
    }
}