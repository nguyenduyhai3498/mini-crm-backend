import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  action: string; // e.g., 'create_post', 'send_message', 'update_tenant'

  @Column({ nullable: true })
  entityType: string; // e.g., 'post', 'message', 'tenant'

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}






