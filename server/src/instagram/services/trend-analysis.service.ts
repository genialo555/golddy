import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../user/user.entity';
import { Post } from '../../posts/post.entity';
import { Benchmark } from '../../benchmarks/benchmark.entity';
import { FollowersHistory } from '../../followers_history/followers_history.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';

interface TrendMetrics {
  engagement: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    qualityScore: number;
  };
  reach: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    efficiency: number;
  };
  growth: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    sustainability: number;
  };
  contentPerformance: {
    bestTypes: string[];
    worstTypes: string[];
    improvement: number;
    consistencyScore: number;
  };
  audienceQuality: {
    score: number;
    retention: number;
    engagement: number;
    authenticity: number;
  };
}

export interface TimeframeAnalysis {
  daily: TrendMetrics;
  weekly: TrendMetrics;
  monthly: TrendMetrics;
  quarterly: TrendMetrics;
}

interface CacheEntry {
  data: TimeframeAnalysis;
  timestamp: number;
}

@Injectable()
export class InstagramTrendAnalysisService {
  private readonly logger = new Logger(InstagramTrendAnalysisService.name);
  private readonly MINIMUM_DATA_POINTS = 3;
  private readonly OUTLIER_THRESHOLD = 2.5; // Standard deviations for outlier detection
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Benchmark)
    private readonly benchmarkRepository: Repository<Benchmark>,
    @InjectRepository(FollowersHistory)
    private readonly followersHistoryRepository: Repository<FollowersHistory>,
    @InjectRepository(AudienceQuality)
    private readonly audienceQualityRepository: Repository<AudienceQuality>
  ) {
    // Clean expired cache entries periodically
    setInterval(() => this.cleanExpiredCache(), this.CACHE_TTL);
  }

  async analyzeTrends(userId: number): Promise<TimeframeAnalysis> {
    try {
      // Try to get from cache first
      const cachedAnalysis = this.getCachedAnalysis(userId);
      if (cachedAnalysis) {
        this.logger.debug(`Returning cached trend analysis for user ${userId}`);
        return cachedAnalysis;
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Validate user has sufficient data for analysis
      await this.validateDataAvailability(user);

      const now = new Date();
      
      const analysis = {
        daily: await this.analyzeTimeframe(user, this.getDateRange(now, 'daily')),
        weekly: await this.analyzeTimeframe(user, this.getDateRange(now, 'weekly')),
        monthly: await this.analyzeTimeframe(user, this.getDateRange(now, 'monthly')),
        quarterly: await this.analyzeTimeframe(user, this.getDateRange(now, 'quarterly'))
      };

      // Cache the results
      this.cacheAnalysis(userId, analysis);
      
      return analysis;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error analyzing trends for user ${userId}:`, error.stack);
      throw new Error('Failed to analyze trends. Please try again later.');
    }
  }

  private getCachedAnalysis(userId: number): TimeframeAnalysis | null {
    const cacheKey = `trends:${userId}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private cacheAnalysis(userId: number, analysis: TimeframeAnalysis): void {
    const cacheKey = `trends:${userId}`;
    this.cache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  async invalidateCache(userId: number): Promise<void> {
    const cacheKey = `trends:${userId}`;
    this.cache.delete(cacheKey);
    this.logger.debug(`Cache invalidated for user ${userId}`);
  }

  private async validateDataAvailability(user: User): Promise<void> {
    const [postsCount, followersCount, benchmarksCount] = await Promise.all([
      this.postRepository.count({ where: { user: { id: user.id } } }),
      this.followersHistoryRepository.count({ where: { user: { id: user.id } } }),
      this.benchmarkRepository.count({ where: { user: { id: user.id } } })
    ]);

    if (postsCount < this.MINIMUM_DATA_POINTS) {
      throw new BadRequestException(
        `Insufficient post data for analysis. At least ${this.MINIMUM_DATA_POINTS} posts required.`
      );
    }

    if (followersCount < this.MINIMUM_DATA_POINTS) {
      throw new BadRequestException(
        `Insufficient followers history for analysis. At least ${this.MINIMUM_DATA_POINTS} data points required.`
      );
    }

    if (benchmarksCount < this.MINIMUM_DATA_POINTS) {
      throw new BadRequestException(
        `Insufficient benchmark data for analysis. At least ${this.MINIMUM_DATA_POINTS} benchmarks required.`
      );
    }
  }

  private async analyzeTimeframe(
    user: User,
    { current, previous }: { current: DateRange; previous: DateRange }
  ): Promise<TrendMetrics> {
    const [currentMetrics, previousMetrics] = await Promise.all([
      this.calculateMetrics(user, current),
      this.calculateMetrics(user, previous)
    ]);

    // Validate metrics before calculation
    this.validateMetrics(currentMetrics, 'current');
    this.validateMetrics(previousMetrics, 'previous');

    return {
      engagement: this.calculateTrend(currentMetrics.engagement, previousMetrics.engagement),
      reach: this.calculateTrend(currentMetrics.reach, previousMetrics.reach),
      growth: this.calculateTrend(currentMetrics.growth, previousMetrics.growth),
      contentPerformance: await this.analyzeContentPerformance(user, current, previous),
      audienceQuality: currentMetrics.audienceQuality
    };
  }

  private validateMetrics(metrics: any, period: string): void {
    if (!metrics || typeof metrics !== 'object') {
      throw new BadRequestException(`Invalid ${period} metrics data`);
    }

    const requiredMetrics = ['engagement', 'reach', 'growth'];
    for (const metric of requiredMetrics) {
      if (typeof metrics[metric] !== 'number' || isNaN(metrics[metric])) {
        throw new BadRequestException(`Invalid ${metric} value in ${period} metrics`);
      }
    }
  }

  private async calculateMetrics(user: User, range: DateRange) {
    const [benchmarks, history, quality, posts] = await Promise.all([
      this.benchmarkRepository.find({
        where: {
          user: { id: user.id },
          createdAt: Between(range.start, range.end)
        },
        order: { createdAt: 'DESC' }
      }),
      this.followersHistoryRepository.find({
        where: {
          user: { id: user.id },
          timestamp: Between(range.start, range.end)
        },
        order: { timestamp: 'DESC' }
      }),
      this.audienceQualityRepository.find({
        where: {
          user: { id: user.id },
          analyzedAt: Between(range.start, range.end)
        },
        order: { analyzedAt: 'DESC' }
      }),
      this.postRepository.find({
        where: {
          user: { id: user.id },
          createdAt: Between(range.start, range.end)
        },
        order: { createdAt: 'DESC' }
      })
    ]);

    // Remove outliers from metrics
    const cleanBenchmarks = this.removeOutliers(benchmarks, 'additionalMetrics');
    const cleanHistory = this.removeOutliers(history, 'count');
    const cleanPosts = this.removeOutliers(posts, 'engagementRate');

    const contentTypes = this.analyzeContentTypes(cleanPosts);

    return {
      engagement: {
        value: this.averageMetric(cleanBenchmarks, 'engagementRate'),
        qualityScore: this.calculateEngagementQuality(cleanPosts)
      },
      reach: {
        value: this.averageMetric(cleanBenchmarks, 'reachRate'),
        efficiency: this.calculateReachEfficiency(cleanPosts)
      },
      growth: {
        value: this.calculateGrowthRate(cleanHistory),
        sustainability: this.calculateGrowthSustainability(cleanHistory)
      },
      contentPerformance: {
        ...contentTypes,
        consistencyScore: contentTypes.consistencyScore
      },
      audienceQuality: {
        score: this.calculateQualityScore(quality),
        retention: this.calculateAudienceRetention(cleanHistory),
        engagement: this.calculateAudienceEngagement(cleanPosts),
        authenticity: this.calculateAudienceAuthenticity(quality)
      }
    };
  }

  private removeOutliers<T>(items: T[], key: keyof T): T[] {
    if (items.length < 4) return items; // Need at least 4 points for outlier detection

    const values = items.map(item => Number(item[key]));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length
    );

    return items.filter(item => {
      const value = Number(item[key]);
      return Math.abs(value - mean) <= this.OUTLIER_THRESHOLD * std;
    });
  }

  private async analyzeContentPerformance(
    user: User,
    current: DateRange,
    previous: DateRange
  ): Promise<TrendMetrics['contentPerformance']> {
    const [currentPosts, previousPosts] = await Promise.all([
      this.postRepository.find({
        where: {
          user: { id: user.id },
          createdAt: Between(current.start, current.end)
        }
      }),
      this.postRepository.find({
        where: {
          user: { id: user.id },
          createdAt: Between(previous.start, previous.end)
        }
      })
    ]);

    const currentPerformance = this.calculateContentTypePerformance(currentPosts);
    const previousPerformance = this.calculateContentTypePerformance(previousPosts);

    const improvement = this.calculateOverallImprovement(currentPerformance, previousPerformance);
    const consistencyScore = this.calculateConsistencyScore(currentPosts);

    return {
      bestTypes: this.getTopPerformers(currentPerformance, 3),
      worstTypes: this.getTopPerformers(currentPerformance, 3, true),
      improvement,
      consistencyScore
    };
  }

  private calculateContentTypePerformance(posts: Post[]): Map<string, number> {
    const performance = new Map<string, number>();
    const counts = new Map<string, number>();

    posts.forEach(post => {
      const current = performance.get(post.type) || 0;
      const count = counts.get(post.type) || 0;
      performance.set(post.type, current + post.engagementRate);
      counts.set(post.type, count + 1);
    });

    // Calculate averages
    performance.forEach((total, type) => {
      const count = counts.get(type) || 1;
      performance.set(type, total / count);
    });

    return performance;
  }

  private getTopPerformers(
    performance: Map<string, number>,
    count: number,
    reverse = false
  ): string[] {
    return Array.from(performance.entries())
      .sort(([, a], [, b]) => reverse ? a - b : b - a)
      .slice(0, count)
      .map(([type]) => type);
  }

  private calculateOverallImprovement(
    current: Map<string, number>,
    previous: Map<string, number>
  ): number {
    let totalImprovement = 0;
    let count = 0;

    current.forEach((value, type) => {
      const previousValue = previous.get(type);
      if (previousValue) {
        totalImprovement += ((value - previousValue) / previousValue) * 100;
        count++;
      }
    });

    return count > 0 ? totalImprovement / count : 0;
  }

  private calculateTrend(
    current: { value: number; [key: string]: number },
    previous: { value: number; [key: string]: number }
  ): any {
    const change = previous.value !== 0 ? ((current.value - previous.value) / previous.value) * 100 : 0;
    return {
      current: current.value,
      previous: previous.value,
      change,
      trend: this.determineTrend(change),
      ...Object.keys(current)
        .filter(key => key !== 'value')
        .reduce((acc, key) => ({ ...acc, [key]: current[key] }), {})
    };
  }

  private determineTrend(change: number): 'up' | 'down' | 'stable' {
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private averageMetric(items: any[], key: string): number {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      const value = item.additionalMetrics?.[key] || 0;
      return sum + value;
    }, 0) / items.length;
  }

  private calculateGrowthRate(history: FollowersHistory[]): number {
    if (history.length < 2) return 0;
    const latest = history[0];
    const oldest = history[history.length - 1];
    return ((latest.count - oldest.count) / oldest.count) * 100;
  }

  private getDateRange(now: Date, timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly'): {
    current: DateRange;
    previous: DateRange;
  } {
    const ranges = {
      daily: { days: 1 },
      weekly: { days: 7 },
      monthly: { days: 30 },
      quarterly: { days: 90 }
    };

    const days = ranges[timeframe].days;
    const end = new Date(now);
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousEnd = new Date(currentStart);
    const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

    return {
      current: { start: currentStart, end },
      previous: { start: previousStart, end: previousEnd }
    };
  }

  private calculateConsistencyScore(posts: Post[]): number {
    if (posts.length < 2) return 0;
    
    const engagementRates = posts.map(p => p.engagementRate);
    const mean = engagementRates.reduce((a, b) => a + b, 0) / posts.length;
    const variance = engagementRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / posts.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation means more consistency
    return Math.max(0, 100 - (stdDev * 10));
  }

  private calculateAudienceRetention(history: FollowersHistory[]): number {
    if (history.length < 2) return 0;
    
    const lostFollowers = history.reduce((total, record) => total + (record.lostCount || 0), 0);
    const totalFollowers = history[0].count;
    
    return Math.max(0, 100 - ((lostFollowers / totalFollowers) * 100));
  }

  private calculateEngagementQuality(posts: Post[]): number {
    if (posts.length === 0) return 0;
    
    const weights = {
      comments: 0.4,
      saves: 0.3,
      shares: 0.3
    };
    
    return posts.reduce((total, post) => {
      const commentScore = (post.commentsCount || 0) * weights.comments;
      const saveScore = (post.saves || 0) * weights.saves;
      const shareScore = (post.shares || 0) * weights.shares;
      return total + (commentScore + saveScore + shareScore);
    }, 0) / posts.length;
  }

  private calculateReachEfficiency(posts: Post[]): number {
    if (posts.length === 0) return 0;
    
    return posts.reduce((total, post) => {
      const reach = post.reach || 0;
      const engagement = post.engagementRate || 0;
      return total + (engagement / reach);
    }, 0) / posts.length * 100;
  }

  private calculateGrowthSustainability(history: FollowersHistory[]): number {
    if (history.length < 7) return 0;
    
    const weeklyGrowth = [];
    for (let i = 0; i < history.length - 7; i += 7) {
      const weekGain = history[i].count - history[i + 6].count;
      weeklyGrowth.push(weekGain);
    }
    
    const growthRates = weeklyGrowth.map(g => ({ engagementRate: g }));
    const growthConsistency = this.calculateConsistencyScore(growthRates as any);
    return growthConsistency;
  }

  private calculateAudienceEngagement(posts: Post[]): number {
    if (posts.length === 0) return 0;
    
    const totalEngagement = posts.reduce((total, post) => {
      return total + (post.engagementRate || 0);
    }, 0);
    
    return (totalEngagement / posts.length) * 100;
  }

  private calculateAudienceAuthenticity(quality: AudienceQuality[]): number {
    if (quality.length === 0) return 0;
    
    return quality.reduce((total, q) => {
      return total + q.overallScore;
    }, 0) / quality.length;
  }

  private analyzeContentTypes(posts: Post[]): { bestTypes: string[]; worstTypes: string[]; improvement: number; consistencyScore: number } {
    const typePerformance = new Map<string, number[]>();
    
    posts.forEach(post => {
      if (!typePerformance.has(post.type)) {
        typePerformance.set(post.type, []);
      }
      typePerformance.get(post.type)?.push(post.engagementRate || 0);
    });

    const typeAverages = Array.from(typePerformance.entries()).map(([type, rates]) => ({
      type,
      average: rates.reduce((a, b) => a + b, 0) / rates.length,
      consistency: this.calculateTypeConsistency(rates)
    }));

    const sorted = typeAverages.sort((a, b) => b.average - a.average);
    const improvement = sorted.length > 1 ? 
      ((sorted[0].average - sorted[sorted.length - 1].average) / sorted[sorted.length - 1].average) * 100 : 0;

    const overallConsistency = typeAverages.reduce((sum, type) => sum + type.consistency, 0) / typeAverages.length;

    return {
      bestTypes: sorted.slice(0, 3).map(t => t.type),
      worstTypes: sorted.slice(-3).reverse().map(t => t.type),
      improvement,
      consistencyScore: overallConsistency
    };
  }

  private calculateTypeConsistency(rates: number[]): number {
    if (rates.length < 2) return 100;
    
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation means more consistency
    return Math.max(0, 100 - (stdDev * 10));
  }

  private calculateQualityScore(quality: AudienceQuality[]): number {
    if (quality.length === 0) return 0;
    
    return quality.reduce((total, q) => {
      return total + (
        q.overallScore * 0.4 +
        q.engagementRate * 0.3 +
        q.commentQuality * 0.2 +
        q.reachEfficiency * 0.1
      );
    }, 0) / quality.length;
  }
}

interface DateRange {
  start: Date;
  end: Date;
} 