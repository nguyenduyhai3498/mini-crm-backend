import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { SocialPlatform, SocialPageStatus } from '../common/enums/social-platform.enum';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('social_pages')
export class SocialPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SocialPlatform,
  })
  platform: SocialPlatform;

  @Column()
  pageId: string; // ID from social platform (Facebook Page ID, Instagram Account ID, Gmail address)

  @Column({ type: 'text' })
  accessToken: string; // Encrypted token

  @Column({ type: 'text', nullable: true })
  refreshToken: string; // For platforms that support refresh tokens

  @Column({ nullable: true })
  tokenExpiresAt: Date;

  @Column({
    type: 'enum',
    enum: SocialPageStatus,
    default: SocialPageStatus.ACTIVE,
  })
  status: SocialPageStatus;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional platform-specific data

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.socialPages)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToMany(() => User, (user) => user.authorizedPages)
  authorizedUsers: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




