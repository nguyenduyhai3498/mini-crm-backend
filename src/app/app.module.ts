import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { TenantModule } from '../tenant/tenant.module';
import { SocialModule } from '../social/social.module';
import { PostsModule } from '../posts/posts.module';
import { MessagesModule } from '../messages/messages.module';
import { EmailModule } from '../email/email.module';
import * as entities from '../entities';
import { WebhookModule } from '../webhook/webhook.module';
import { Open3rdModule } from '../open3rd/open3rd.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'hcrm'),
        entities: Object.values(entities),
        synchronize: configService.get('DB_SYNC', 'true') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    AdminModule,
    TenantModule,
    SocialModule,
    PostsModule,
    MessagesModule,
    EmailModule,
    WebhookModule,
    Open3rdModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
