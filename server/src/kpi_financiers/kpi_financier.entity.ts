import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('kpi_financiers')
export class KPIFinancier {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.kpiFinanciers)
  user: User;

  @Column('jsonb')
  metrics: {
    reach: number;
    engagement: number;
    estimatedRevenue: number;
    platformValue: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

