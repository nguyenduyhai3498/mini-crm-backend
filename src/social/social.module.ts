import { Module } from '@nestjs/common';
import { FacebookService } from './services/facebook.service';
import { InstagramService } from './services/instagram.service';
import { GmailService } from './services/gmail.service';

@Module({
  providers: [FacebookService, InstagramService, GmailService],
  exports: [FacebookService, InstagramService, GmailService],
})
export class SocialModule {}






