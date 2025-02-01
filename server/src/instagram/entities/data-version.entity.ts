import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../user/user.entity';
import { DataChange } from '../types/sync.types';

@Entity('data_versions')
@Index(['user', 'version'])
export class DataVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  timestamp: Date;

  @Column()
  source: string;

  @Column('jsonb')
  changes: DataChange[];

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, user => user.dataVersions)
  user: User;

  @Column('jsonb', { default: {} })
  syncMetadata: {
    duration: number;
    entityCounts: Record<string, number>;
    errors: Array<{
      entityType: string;
      error: string;
      context?: Record<string, any>;
    }>;
  };
} 