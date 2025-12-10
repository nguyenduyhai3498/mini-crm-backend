import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SocialPlatform } from '../common/enums/social-platform.enum';
import { SocialPage } from './social-page.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalId: string; // ID from social platform

  @Column()
  conversationId: string; // Thread/Conversation ID

  @Column()
  socialPageId: string;

  @ManyToOne(() => SocialPage)
  @JoinColumn({ name: 'socialPageId' })
  socialPage: SocialPage;

  @Column({
    type: 'enum',
    enum: SocialPlatform,
  })
  platform: SocialPlatform;

  @Column({ type: 'text' })
  content: string;

  @Column()
  senderId: string; // External sender ID

  @Column({ nullable: true })
  senderName: string;

  @Column({ default: false })
  isFromPage: boolean; // true if message is from page, false if from user

  @Column({ default: false })
  isRead: boolean;

  @Column('simple-array', { nullable: true })
  attachments: string[];

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column()
  sentAt: Date; // When it was sent on the social platform

  @CreateDateColumn()
  createdAt: Date; // When it was synced to our database

  @UpdateDateColumn()
  updatedAt: Date;
}






