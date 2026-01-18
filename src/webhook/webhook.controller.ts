import {
    Controller,
    Get,
    Body,
  } from '@nestjs/common';
  
import { WebhookService } from './webhook.service';
import { SocialPage } from '../entities/social-page.entity';
import { Any } from 'typeorm/browser';


@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @Get('facebook')
    async facebookWebhook(@Body() body: any) {
        return this.webhookService.facebookWebhook(body);
    }
}
