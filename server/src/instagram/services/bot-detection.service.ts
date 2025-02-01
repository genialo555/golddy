import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { Post } from '../../posts/post.entity';
import { FollowersHistory } from '../../followers_history/followers_history.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';
import { InstagramBaseService } from './base.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

interface BotDetectionResult {
  isSuspicious: boolean;
  suspicionScore: number;
  reasons: string[];
}

interface MassFollowerMetrics {
  followingCount: number;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  accountAge: number; // in days
}

interface AudienceQualityMetrics {
  suspiciousAccountsPercentage: number;
  massFollowersPercentage: number;
  authenticEngagementRate: number;
  overallScore: number;
  riskFactors: string[];
  saveRate: number;
  shareRate: number;
}

@Injectable()
export class InstagramBotDetectionService extends InstagramBaseService {
  protected readonly logger = new Logger(InstagramBotDetectionService.name);
  
  // Thresholds for bot detection
  private readonly BOT_DETECTION_THRESHOLDS = {
    minFollowers: 10,
    maxFollowingToFollowersRatio: 1.5,
    minEngagementRate: 0.5,
    minAccountAgeDays: 30,
    minPostCount: 5,
    suspiciousGrowthRate: 50, // 50% daily growth is suspicious
    massFollowerThreshold: 7500, // Following more than 7500 accounts
    engagementDeviation: 2.5 // Standard deviations for engagement rate outliers
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(FollowersHistory)
    private readonly followersHistoryRepository: Repository<FollowersHistory>,
    @InjectRepository(AudienceQuality)
    private readonly audienceQualityRepository: Repository<AudienceQuality>,
    configService: ConfigService,
    httpService: HttpService
  ) {
    super(configService, httpService);
  }

  async analyzeAudienceQuality(userId: number): Promise<AudienceQualityMetrics> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const [followers, posts] = await Promise.all([
        this.makeRequest('/user/followers', 'scraper', { username: user.username }),
        this.makeRequest('/user/media', 'scraper', { username: user.username })
      ]);

      const suspiciousAccounts = await this.detectSuspiciousAccounts(followers);
      const massFollowers = await this.detectMassFollowers(followers);
      const authenticEngagement = await this.calculateAuthenticEngagement(posts, followers.length);

      const suspiciousPercentage = (suspiciousAccounts.length / followers.length) * 100;
      const massFollowersPercentage = (massFollowers.length / followers.length) * 100;

      const riskFactors = this.identifyRiskFactors(
        suspiciousPercentage,
        massFollowersPercentage,
        authenticEngagement
      );

      const qualityScore = this.calculateQualityScore(
        suspiciousPercentage,
        massFollowersPercentage,
        authenticEngagement
      );

      // Calculate save and share rates
      const saveRate = this.calculateSaveRate(posts);
      const shareRate = this.calculateShareRate(posts);

      return {
        suspiciousAccountsPercentage: suspiciousPercentage,
        massFollowersPercentage: massFollowersPercentage,
        authenticEngagementRate: authenticEngagement,
        overallScore: qualityScore,
        riskFactors,
        saveRate,
        shareRate
      };
    } catch (error) {
      this.logger.error(`Error analyzing audience quality for user ${userId}:`, error.stack);
      throw error;
    }
  }

  private calculateSaveRate(posts: any[]): number {
    if (!posts.length) return 0;
    return posts.reduce((sum, post) => sum + (post.saveCount || 0), 0) / posts.length;
  }

  private calculateShareRate(posts: any[]): number {
    if (!posts.length) return 0;
    return posts.reduce((sum, post) => sum + (post.shareCount || 0), 0) / posts.length;
  }

  private async detectSuspiciousAccounts(followers: any[]): Promise<any[]> {
    const suspiciousAccounts = [];

    for (const follower of followers) {
      const metrics = await this.getFollowerMetrics(follower);
      const detectionResult = this.analyzeSuspiciousActivity(metrics);

      if (detectionResult.isSuspicious) {
        suspiciousAccounts.push({
          ...follower,
          suspicionScore: detectionResult.suspicionScore,
          reasons: detectionResult.reasons
        });
      }
    }

    return suspiciousAccounts;
  }

  private async detectMassFollowers(followers: any[]): Promise<any[]> {
    return followers.filter(follower => 
      follower.followingCount > this.BOT_DETECTION_THRESHOLDS.massFollowerThreshold
    );
  }

  private async getFollowerMetrics(follower: any): Promise<MassFollowerMetrics> {
    const posts = await this.makeRequest('/user/media', 'scraper', { 
      username: follower.username 
    });

    const accountCreationDate = new Date(follower.createdAt);
    const accountAge = (Date.now() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24);

    const totalEngagement = posts.reduce((sum: number, post: any) => 
      sum + (post.likeCount || 0) + (post.commentsCount || 0), 0
    );

    const engagementRate = posts.length > 0 ? 
      (totalEngagement / posts.length) / follower.followersCount * 100 : 0;

    return {
      followingCount: follower.followingCount,
      followersCount: follower.followersCount,
      postsCount: posts.length,
      engagementRate,
      accountAge
    };
  }

  private analyzeSuspiciousActivity(metrics: MassFollowerMetrics): BotDetectionResult {
    const reasons: string[] = [];
    let suspicionScore = 0;

    // Check following to followers ratio
    if (metrics.followingCount / metrics.followersCount > this.BOT_DETECTION_THRESHOLDS.maxFollowingToFollowersRatio) {
      reasons.push('Unusual following to followers ratio');
      suspicionScore += 25;
    }

    // Check engagement rate
    if (metrics.engagementRate < this.BOT_DETECTION_THRESHOLDS.minEngagementRate) {
      reasons.push('Low engagement rate');
      suspicionScore += 25;
    }

    // Check account age
    if (metrics.accountAge < this.BOT_DETECTION_THRESHOLDS.minAccountAgeDays) {
      reasons.push('Recently created account');
      suspicionScore += 20;
    }

    // Check post count
    if (metrics.postsCount < this.BOT_DETECTION_THRESHOLDS.minPostCount) {
      reasons.push('Low post count');
      suspicionScore += 15;
    }

    // Check mass following behavior
    if (metrics.followingCount > this.BOT_DETECTION_THRESHOLDS.massFollowerThreshold) {
      reasons.push('Mass following behavior');
      suspicionScore += 15;
    }

    return {
      isSuspicious: suspicionScore >= 50,
      suspicionScore,
      reasons
    };
  }

  private async calculateAuthenticEngagement(posts: any[], followersCount: number): Promise<number> {
    if (!posts.length || !followersCount) return 0;

    const engagementRates = posts.map(post => {
      const totalEngagement = (post.likeCount || 0) + (post.commentsCount || 0);
      return (totalEngagement / followersCount) * 100;
    });

    // Remove outliers
    const mean = engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length;
    const std = Math.sqrt(
      engagementRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / engagementRates.length
    );

    const validRates = engagementRates.filter(
      rate => Math.abs(rate - mean) <= this.BOT_DETECTION_THRESHOLDS.engagementDeviation * std
    );

    return validRates.reduce((a, b) => a + b, 0) / validRates.length;
  }

  private identifyRiskFactors(
    suspiciousPercentage: number,
    massFollowersPercentage: number,
    authenticEngagement: number
  ): string[] {
    const riskFactors: string[] = [];

    if (suspiciousPercentage > 20) {
      riskFactors.push(`High percentage of suspicious accounts (${Math.round(suspiciousPercentage)}%)`);
    }

    if (massFollowersPercentage > 15) {
      riskFactors.push(`High percentage of mass followers (${Math.round(massFollowersPercentage)}%)`);
    }

    if (authenticEngagement < 1) {
      riskFactors.push('Low authentic engagement rate');
    }

    return riskFactors;
  }

  private calculateQualityScore(
    suspiciousPercentage: number,
    massFollowersPercentage: number,
    authenticEngagement: number
  ): number {
    // Convert percentages to scores (0-100, higher is better)
    const suspiciousScore = Math.max(0, 100 - suspiciousPercentage);
    const massFollowersScore = Math.max(0, 100 - massFollowersPercentage);
    const engagementScore = Math.min(100, authenticEngagement * 20); // Scale engagement rate to 0-100

    // Weighted average
    const weights = {
      suspicious: 0.4,
      massFollowers: 0.3,
      engagement: 0.3
    };

    return Math.round(
      suspiciousScore * weights.suspicious +
      massFollowersScore * weights.massFollowers +
      engagementScore * weights.engagement
    );
  }
} 