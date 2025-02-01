import { Injectable, Logger } from '@nestjs/common';
import { InstagramBaseService } from './base.service';
import { EngagementMetrics, AudienceQualityScore, BenchmarkMetrics } from '../types/audience.types';

@Injectable()
export class InstagramAudienceQualityService extends InstagramBaseService {
  protected readonly logger = new Logger(InstagramAudienceQualityService.name);

  async analyzeAudienceQuality(username: string): Promise<AudienceQualityScore> {
    try {
      const posts = await this.makeRequest('/user/media', 'scraper', { username });
      const userInfo = await this.makeRequest('/user/info', 'scraper', { username });
      
      const metrics = this.calculateEngagementMetrics(posts);
      const followersCount = userInfo.followersCount || 0;
      
      return this.calculateQualityScore(metrics, followersCount, posts.length);
    } catch (error) {
      this.logger.error(`Error analyzing audience quality for ${username}:`, error.stack);
      throw error;
    }
  }

  private calculateEngagementMetrics(posts: any[]): EngagementMetrics {
    const totals = posts.reduce((acc, post) => ({
      likes: acc.likes + (post.likeCount || 0),
      comments: acc.comments + (post.commentsCount || 0),
      saves: acc.saves + (post.saveCount || 0),
      shares: acc.shares + (post.shareCount || 0),
      reach: acc.reach + (post.reach || 0)
    }), { likes: 0, comments: 0, saves: 0, shares: 0, reach: 0 });

    return {
      likes: totals.likes / posts.length,
      comments: totals.comments / posts.length,
      saves: totals.saves / posts.length,
      shares: totals.shares / posts.length,
      reach: totals.reach / posts.length
    };
  }

  private getBenchmarks(followersCount: number): BenchmarkMetrics {
    // Industry average engagement rates based on followers range
    let baseEngagementRate: number;
    if (followersCount < 5000) {
      baseEngagementRate = 5.6; // Micro-influencers (<5K)
    } else if (followersCount < 20000) {
      baseEngagementRate = 4.2; // Small influencers (5K-20K)
    } else if (followersCount < 100000) {
      baseEngagementRate = 3.4; // Mid-tier influencers (20K-100K)
    } else {
      baseEngagementRate = 2.1; // Macro-influencers (>100K)
    }

    const industryMetrics = {
      engagementRate: 3.5,  // Average across all industries
      reachRate: 30.0,      // Average reach rate
      saveRate: 1.5,        // Average save rate
      shareRate: 1.0        // Average share rate
    };

    const similarMetrics = {
      engagementRate: baseEngagementRate,
      reachRate: 25.0 + (baseEngagementRate * 2), // Correlate with engagement
      saveRate: 1.2 + (baseEngagementRate * 0.1),
      shareRate: 0.8 + (baseEngagementRate * 0.1)
    };

    return {
      industry: industryMetrics,
      similar: similarMetrics
    };
  }

  private calculateQualityScore(
    metrics: EngagementMetrics,
    followersCount: number,
    totalPosts: number
  ): AudienceQualityScore {
    // Calculate engagement rates
    const engagementRate = ((metrics.likes + metrics.comments) / followersCount) * 100;
    const saveRate = (metrics.saves / followersCount) * 100;
    const shareRate = (metrics.shares / followersCount) * 100;
    const reachEfficiency = (metrics.reach / followersCount) * 100;

    // Calculate comment quality (ratio of comments to likes)
    const commentQuality = metrics.comments > 0 ? 
      (metrics.comments / metrics.likes) * 100 : 0;

    // Get benchmarks based on followers range
    const benchmarks = this.getBenchmarks(followersCount);

    // Calculate follower growth (can be enhanced with historical data)
    const followerGrowth = 0; // This should be calculated from historical data

    // Calculate overall score (weighted average of all metrics)
    const overallScore = this.calculateOverallScore({
      engagementRate,
      commentQuality,
      saveRate,
      shareRate,
      reachEfficiency
    });

    return {
      overallScore,
      engagementRate,
      commentQuality,
      reachEfficiency,
      saveRate,
      shareRate,
      benchmarks,
      metrics: {
        totalFollowers: followersCount,
        averageLikes: metrics.likes,
        averageComments: metrics.comments,
        averageSaves: metrics.saves,
        averageShares: metrics.shares,
        averageReach: metrics.reach,
        totalPosts,
        followerGrowth
      }
    };
  }

  private calculateOverallScore(metrics: {
    engagementRate: number;
    commentQuality: number;
    saveRate: number;
    shareRate: number;
    reachEfficiency: number;
  }): number {
    // Weighted scoring system
    const weights = {
      engagementRate: 0.3,
      commentQuality: 0.2,
      saveRate: 0.2,
      shareRate: 0.15,
      reachEfficiency: 0.15
    };

    // Normalize each metric to a 0-100 scale and apply weights
    const normalizedScore = 
      (metrics.engagementRate * weights.engagementRate) +
      (metrics.commentQuality * weights.commentQuality) +
      (metrics.saveRate * weights.saveRate) +
      (metrics.shareRate * weights.shareRate) +
      (metrics.reachEfficiency * weights.reachEfficiency);

    // Cap the score at 100
    return Math.min(100, normalizedScore);
  }
} 