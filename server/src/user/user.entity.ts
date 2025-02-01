import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { Post } from '../posts/post.entity';
import { Collaboration } from '../collaborations/collaboration.entity';
import { SocialNetwork } from '../social_networks/social_network.entity';
import { NotificationPreferences } from '../notification_preferences/notification_preferences.entity';
import { AffinityScore } from '../affinity_scores/affinity_score.entity';
import { KPIFinancier } from '../kpi_financiers/kpi_financier.entity';
import { FollowersHistory } from '../followers_history/followers_history.entity';
import { ActivityHours } from '../activity_hours/activity_hours.entity';
import { AudienceQuality } from '../audience_quality/audience_quality.entity';
import { Benchmark } from '../benchmarks/benchmark.entity';
import { Demographics } from '../demographics/demographics.entity';
import { Feedback } from '../feedback/feedback.entity';
import { GrowthPrediction } from '../growth-predictions/growth-prediction.entity';
import { Integration } from '../integrations/integration.entity';
import { Location } from '../locations/location.entity';
import { Notification } from '../notifications/notification.entity';
import { Recommendation } from '../recommendations/recommendation.entity';
import { DataVersion } from '../instagram/entities/data-version.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ length: 50, name: 'social_network' })
  socialNetwork: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 255, nullable: true, name: 'profile_image_url' })
  profileImageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string;

  @Column({ name: 'is_two_factor_enabled', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ name: 'firebase_uid', nullable: true })
  firebaseUid: string;

  @Column({ name: 'instagram_username', nullable: true })
  instagramUsername: string;

  @Column({ name: 'instagram_id', nullable: true })
  instagramId: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ name: 'followers_count', type: 'integer', default: 0 })
  followersCount: number;

  @OneToMany(() => Post, (post: Post) => post.user, { lazy: true })
  posts: Post[];

  @OneToMany(() => Collaboration, (collaboration: Collaboration) => collaboration.influencer, { lazy: true })
  collaborations: Promise<Collaboration[]>;

  @OneToMany(() => SocialNetwork, (socialNetwork: SocialNetwork) => socialNetwork.user, { lazy: true })
  socialNetworks: Promise<SocialNetwork[]>;

  @OneToMany(() => NotificationPreferences, (notificationPreference: NotificationPreferences) => notificationPreference.user, { lazy: true })
  notificationPreferences: Promise<NotificationPreferences[]>;

  @OneToMany(() => AffinityScore, (affinityScore: AffinityScore) => affinityScore.user, { lazy: true })
  affinityScores: Promise<AffinityScore[]>;

  @OneToMany(() => KPIFinancier, (kpiFinancier: KPIFinancier) => kpiFinancier.user, { lazy: true })
  kpiFinanciers: Promise<KPIFinancier[]>;

  @OneToMany(() => FollowersHistory, (history: FollowersHistory) => history.user, { lazy: true })
  followersHistory: Promise<FollowersHistory[]>;

  @OneToMany(() => ActivityHours, (activityHours: ActivityHours) => activityHours.user, { lazy: true })
  activityHours: Promise<ActivityHours[]>;

  @OneToMany(() => AudienceQuality, (audienceQuality: AudienceQuality) => audienceQuality.user, { lazy: true })
  audienceQualities: Promise<AudienceQuality[]>;

  @OneToMany(() => Demographics, (demographics: Demographics) => demographics.user, { lazy: true })
  demographics: Promise<Demographics[]>;

  @OneToMany(() => Feedback, (feedback: Feedback) => feedback.user, { lazy: true })
  feedback: Promise<Feedback[]>;

  @OneToMany(() => GrowthPrediction, (prediction: GrowthPrediction) => prediction.user, { lazy: true })
  growthPredictions: Promise<GrowthPrediction[]>;

  @OneToMany(() => Integration, (integration: Integration) => integration.user, { lazy: true })
  integrations: Promise<Integration[]>;

  @OneToMany(() => Location, (location: Location) => location.posts, { lazy: true })
  locations: Location[];

  @OneToMany(() => Notification, (notification: Notification) => notification.user, { lazy: true })
  notifications: Promise<Notification[]>;

  @OneToMany(() => Recommendation, (recommendation: Recommendation) => recommendation.user, { lazy: true })
  recommendations: Promise<Recommendation[]>;

  @OneToMany(() => Benchmark, (benchmark: Benchmark) => benchmark.user, { lazy: true })
  benchmarks: Promise<Benchmark[]>;

  @OneToMany(() => DataVersion, dataVersion => dataVersion.user)
  dataVersions: DataVersion[];
}
