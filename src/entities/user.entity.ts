import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole, AdminPermission, TenantPermission } from '../common/enums/role.enum';
import { Tenant } from './tenant.entity';
import { SocialPage } from './social-page.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TENANT_USER,
  })
  role: UserRole;

  @Column('simple-array', { nullable: true })
  adminPermissions: AdminPermission[];

  @Column('simple-array', { nullable: true })
  tenantPermissions: TenantPermission[];

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Pages that this user has permission to view messages
  @ManyToMany(() => SocialPage, (page) => page.authorizedUsers)
  @JoinTable({
    name: 'user_page_permissions',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pageId', referencedColumnName: 'id' },
  })
  authorizedPages: SocialPage[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLogin: Date;
}




