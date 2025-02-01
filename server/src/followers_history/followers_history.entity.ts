import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('followers_history')
export class FollowersHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'followers_count', type: 'integer', nullable: false })
  count: number;

  @Column({ name: 'gainedCount', type: 'integer', nullable: false, default: 0 })
  gainedCount: number;

  @Column({ name: 'lostCount', type: 'integer', nullable: false, default: 0 })
  lostCount: number;

  @Column({ name: 'growthRate', type: 'decimal', precision: 5, scale: 2, nullable: false, default: 0 })
  growthRate: number;

  @Column({ name: 'recorded_at', type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;

  @ManyToOne(() => User, user => user.followersHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}
