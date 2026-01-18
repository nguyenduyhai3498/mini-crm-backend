import {
    Injectable,
  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialPage } from 'src/entities/social-page.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class WebhookService {
    constructor(
        @InjectRepository(SocialPage)
        private socialPageRepository: Repository<SocialPage>,
    ) {}

    async facebookWebhook(body: any) {
        if(body.hub.verify_token === process.env.FACEBOOK_VERIFY_TOKEN) {
            return body.hub.challenge;
        }

        
    }
}