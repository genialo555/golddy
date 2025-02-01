import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('activity_hours')
@Index('idx_activity_hours_user_date', ['user', 'createdAt'])
export class ActivityHours {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.activityHours, {
    onDelete: 'CASCADE'
  })
  user: User;

  @Column('jsonb')
  hours: {
    [hour: string]: number;
  };

  @Column({ type: 'float8', name: 'peak_activity_score' })
  peakActivityScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}