import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

interface AudienceMetrics {
  totalFollowers: number;
  averageLikes: number;
  averageComments: number;
  averageSaves: number;
  averageShares: number;
  averageReach: number;
  totalPosts: number;
  followerGrowth: number;
}

@Entity('audience_qualities')
export class AudienceQuality {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.audienceQualities)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'float' })
  overallScore: number;

  @Column({ type: 'float' })
  engagementRate: number;

  @Column({ type: 'float' })
  commentQuality: number;

  @Column({ type: 'float' })
  reachEfficiency: number;

  @Column({ type: 'float' })
  saveRate: number;

  @Column({ type: 'float' })
  shareRate: number;

  @Column({ type: 'jsonb' })
  benchmarks: {
    industry: {
      engagementRate: number;
      reachRate: number;
      saveRate: number;
      shareRate: number;
    };
    similar: {
      engagementRate: number;
      reachRate: number;
      saveRate: number;
      shareRate: number;
    };
  };

  @Column({ type: 'jsonb' })
  metrics: AudienceMetrics;

  @CreateDateColumn({ name: 'analyzed_at' })
  analyzedAt: Date;
}
