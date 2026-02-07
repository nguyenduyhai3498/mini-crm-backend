import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_settings')
export class TenantSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json', name: 'brand_setting' })
  brandSettings: Record<string, any>;

  @Column({ type: 'json', name: 'system_setting' })
  systemSettings: Record<string, any>;

  @Column({ type: 'json', name: 'content_strategy' })
  contentStrategy: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @Column({ nullable: false })
  // tenantId: string;
  
  @OneToOne(() => Tenant, (tenant) => tenant.tenantSettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' }) // ✅ FK nằm ở đây
  tenant: Tenant;
}


