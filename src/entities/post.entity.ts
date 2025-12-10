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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalId: string; // ID from social platform

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

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column('simple-array', { nullable: true })
  mediaUrls: string[];

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @Column({ type: 'int', default: 0 })
  shares: number;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional platform-specific data

  @Column()
  postedAt: Date; // When it was posted on the social platform

  @CreateDateColumn()
  createdAt: Date; // When it was synced to our database

  @UpdateDateColumn()
  updatedAt: Date;
}






