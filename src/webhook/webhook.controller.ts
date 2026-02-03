import {
    Controller,
    Get,
    Body,
  } from '@nestjs/common';
  
import { WebhookService } from './webhook.service';
import { Public } from 'src/auth/decorators/public.decorator';


@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @Public()
    @Get('facebook')
    async facebookWebhook(@Body() body: any) {
        return this.webhookService.facebookWebhook(body);
    }
}
