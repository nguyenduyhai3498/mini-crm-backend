import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { SocialPage } from './social-page.entity';
import { TenantSettings } from './tenant-settings.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', default: 5 })
  maxSocialPages: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => SocialPage, (page) => page.tenant)
  socialPages: SocialPage[];

  @OneToOne(() => TenantSettings, (settings) => settings.tenant, { cascade: true })
  tenantSettings: TenantSettings;
}


