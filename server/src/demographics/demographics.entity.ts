import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('demographics')
@Index('idx_demographics_user_date', ['user', 'recordedAt'])
export class Demographics {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.demographics, {
    onDelete: 'CASCADE'
  })
  user: User;

  @Column({ type: 'jsonb', name: 'age_distribution' })
  ageDistribution: {
    '13-17': number;
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45-54': number;
    '55+': number;
  };

  @Column({ type: 'jsonb', name: 'gender_distribution' })
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };

  @Column({ type: 'jsonb', name: 'top_countries' })
  topCountries: Array<{
    country: string;
    percentage: number;
    count: number;
  }>;

  @Column({ type: 'jsonb', name: 'top_cities' })
  topCities: Array<{
    city: string;
    country: string;
    percentage: number;
    count: number;
  }>;

  @Column({ type: 'jsonb', name: 'languages' })
  languages: Array<{
    language: string;
    percentage: number;
    count: number;
  }>;

  @Column({ type: 'jsonb', name: 'interests' })
  interests: Array<{
    category: string;
    percentage: number;
    count: number;
  }>;

  @Column({ type: 'jsonb', name: 'activity_times' })
  activityTimes: {
    weekday: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    weekend: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
  };

  @Column({ type: 'jsonb', name: 'location_distribution' })
  locationDistribution: Record<string, number>;

  @Column({ type: 'jsonb', name: 'follower_types' })
  followerTypes: {
    regular: number;
    business: number;
    creator: number;
  };

  @Column({ type: 'integer', name: 'total_followers' })
  totalFollowers: number;

  @Column({ type: 'float8', name: 'engagement_rate' })
  engagementRate: number;

  @Column({ type: 'jsonb', name: 'growth_metrics' })
  growthMetrics: {
    daily: number;
    weekly: number;
    monthly: number;
    yearToDate: number;
  };

  @Column({ type: 'float', name: 'verified_followers_percentage' })
  verifiedFollowersPercentage: number;

  @Column({ type: 'int', nullable: true })
  reach: number;

  @Column('jsonb', { nullable: true })
  metrics: {
    reach: number;
    ageRanges: {
      [key: string]: number;
    };
    topCities: {
      name: string;
      percentage: number;
    }[];
    topCountries: {
      name: string;
      percentage: number;
    }[];
  };

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'last_updated', type: 'timestamp with time zone' })
  lastUpdated: Date;
}
