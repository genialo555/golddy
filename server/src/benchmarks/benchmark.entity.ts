import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum BenchmarkCategory {
  ENGAGEMENT = 'engagement',
  REACH = 'reach',
  GROWTH = 'growth',
  CONVERSION = 'conversion'
}

export enum InfluencerTier {
  MICRO = 'micro',
  SMALL = 'small',
  MID = 'mid',
  MACRO = 'macro',
  MEGA = 'mega'
}

interface IndustryMetrics {
  averageEngagementRate: number;
  averageReachRate: number;
  averageFollowerGrowth: number;
  averagePostFrequency: number;
  topHashtags: string[];
  bestPostingTimes: string[];
  contentTypeDistribution: {
    [key: string]: number;
  };
}

interface CompetitorMetrics {
  username: string;
  followerCount: number;
  engagementRate: number;
  postFrequency: number;
  contentQuality: number;
  growthRate: number;
}

@Entity('benchmarks')
export class Benchmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.benchmarks)
  user: User;

  @Column({
    type: 'enum',
    enum: BenchmarkCategory
  })
  category: BenchmarkCategory;

  @Column({
    type: 'enum',
    enum: InfluencerTier
  })
  influencerTier: InfluencerTier;

  @Column({ type: 'varchar' })
  niche: string;

  @Column({ type: 'float' })
  averageValue: number;

  @Column({ type: 'float' })
  medianValue: number;

  @Column({ type: 'float' })
  topPerformerValue: number;

  @Column({ type: 'jsonb', nullable: true })
  additionalMetrics: {
    engagementRate?: number;
    reachRate?: number;
    conversionRate?: number;
    growthRate?: number;
    commentRate?: number;
    saveRate?: number;
    // Historical metrics
    previousEngagementRate?: number;
    previousReachRate?: number;
    previousGrowthRate?: number;
    engagementRateChange?: number;
    reachRateChange?: number;
    growthRateChange?: number;
  };

  @Column({ type: 'int' })
  sampleSize: number;

  @Column({ type: 'jsonb' })
  industryMetrics: IndustryMetrics;

  @Column({ type: 'jsonb' })
  competitorMetrics: CompetitorMetrics[];

  @Column({ type: 'float' })
  performanceScore: number;

  @Column({ type: 'jsonb' })
  recommendations: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
