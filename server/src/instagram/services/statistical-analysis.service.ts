import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../posts/post.entity';
import { FollowersHistory } from '../../followers_history/followers_history.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';
import { User } from '../../user/user.entity';

export interface StatisticalMetrics {
  mean: number;
  median: number;
  standardDeviation: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
}

export interface EngagementAnalysis {
  overall: StatisticalMetrics;
  byContentType: Record<string, StatisticalMetrics>;
  byTimeOfDay: Record<string, StatisticalMetrics>;
  byDayOfWeek: Record<string, StatisticalMetrics>;
  trends: {
    correlation: number;
    seasonality: number;
    significance: number;
  };
}

export interface GrowthAnalysis {
  followerGrowth: StatisticalMetrics;
  growthRate: StatisticalMetrics;
  retentionRate: StatisticalMetrics;
  churnRate: StatisticalMetrics;
  projections: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
    confidence: number;
  };
}

export interface ContentAnalysis {
  performance: {
    engagement: StatisticalMetrics;
    reach: StatisticalMetrics;
    conversion: StatisticalMetrics;
  };
  contentTypes: Record<string, {
    frequency: number;
    effectiveness: StatisticalMetrics;
    impact: number;
  }>;
  timing: {
    optimal: {
      dayOfWeek: string;
      timeOfDay: string;
      confidence: number;
    };
    analysis: StatisticalMetrics;
  };
}

@Injectable()
export class InstagramStatisticalAnalysisService {
  private readonly logger = new Logger(InstagramStatisticalAnalysisService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(FollowersHistory)
    private readonly followersHistoryRepository: Repository<FollowersHistory>,
    @InjectRepository(AudienceQuality)
    private readonly audienceQualityRepository: Repository<AudienceQuality>
  ) {}

  private calculateStatistics(values: number[]): StatisticalMetrics {
    if (!values.length) {
      return {
        mean: 0,
        median: 0,
        standardDeviation: 0,
        confidenceInterval: { lower: 0, upper: 0 },
        quartiles: { q1: 0, q2: 0, q3: 0 }
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    const confidenceLevel = 0.95;
    const z = 1.96; // z-score for 95% confidence
    const marginOfError = z * (standardDeviation / Math.sqrt(values.length));
    
    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);

    return {
      mean,
      median,
      standardDeviation,
      confidenceInterval: {
        lower: mean - marginOfError,
        upper: mean + marginOfError
      },
      quartiles: {
        q1: sorted[q1Index],
        q2: sorted[q2Index],
        q3: sorted[q3Index]
      }
    };
  }

  async analyzeEngagement(userId: number): Promise<EngagementAnalysis> {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } }
    });

    const engagementRates = posts.map(post => 
      (post.likes + post.comments) / (post.reach || 1)
    );

    const byContentType: Record<string, number[]> = {};
    const byTimeOfDay: Record<string, number[]> = {};
    const byDayOfWeek: Record<string, number[]> = {};

    posts.forEach(post => {
      const timestamp = new Date(post.createdAt);
      const hour = timestamp.getHours();
      const day = timestamp.getDay();
      const timeSlot = `${Math.floor(hour / 4) * 4}-${Math.floor(hour / 4) * 4 + 4}`;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
      
      const engagement = (post.likes + post.comments) / (post.reach || 1);
      
      if (!byContentType[post.type]) byContentType[post.type] = [];
      if (!byTimeOfDay[timeSlot]) byTimeOfDay[timeSlot] = [];
      if (!byDayOfWeek[dayName]) byDayOfWeek[dayName] = [];
      
      byContentType[post.type].push(engagement);
      byTimeOfDay[timeSlot].push(engagement);
      byDayOfWeek[dayName].push(engagement);
    });

    return {
      overall: this.calculateStatistics(engagementRates),
      byContentType: Object.fromEntries(
        Object.entries(byContentType).map(([type, rates]) => [
          type,
          this.calculateStatistics(rates)
        ])
      ),
      byTimeOfDay: Object.fromEntries(
        Object.entries(byTimeOfDay).map(([time, rates]) => [
          time,
          this.calculateStatistics(rates)
        ])
      ),
      byDayOfWeek: Object.fromEntries(
        Object.entries(byDayOfWeek).map(([day, rates]) => [
          day,
          this.calculateStatistics(rates)
        ])
      ),
      trends: {
        correlation: this.calculateCorrelation(posts.map(p => new Date(p.createdAt).getTime()), engagementRates),
        seasonality: this.detectSeasonality(engagementRates),
        significance: this.calculateSignificance(engagementRates)
      }
    };
  }

  async analyzeGrowth(userId: number): Promise<GrowthAnalysis> {
    const history = await this.followersHistoryRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'ASC' }
    });

    const growthRates = history.slice(1).map((curr, i) => {
      const prev = history[i];
      return ((curr.count - prev.count) / prev.count) * 100;
    });

    const retentionRates = history.slice(1).map((curr, i) => {
      const prev = history[i];
      return (Math.min(curr.count, prev.count) / prev.count) * 100;
    });

    const churnRates = retentionRates.map(rate => 100 - rate);

    // Calculate projections using linear regression
    const projectionConfidence = this.calculateProjectionConfidence(history.map(h => h.count));

    return {
      followerGrowth: this.calculateStatistics(history.map(h => h.count)),
      growthRate: this.calculateStatistics(growthRates),
      retentionRate: this.calculateStatistics(retentionRates),
      churnRate: this.calculateStatistics(churnRates),
      projections: {
        shortTerm: this.predictGrowth(history, 7), // 7 days
        mediumTerm: this.predictGrowth(history, 30), // 30 days
        longTerm: this.predictGrowth(history, 90), // 90 days
        confidence: projectionConfidence
      }
    };
  }

  async analyzeContent(userId: number): Promise<ContentAnalysis> {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } }
    });
    
    const engagementRates = posts.map(p => (p.likes + p.comments) / (p.reach || 1));
    const reachRates = posts.map(p => p.reach || 0);
    const conversionRates = posts.map(p => (p.saves || 0) / (p.reach || 1));

    const contentTypeStats: Record<string, {
      posts: Post[];
      engagement: number[];
    }> = {};

    posts.forEach(post => {
      if (!contentTypeStats[post.type]) {
        contentTypeStats[post.type] = { posts: [], engagement: [] };
      }
      contentTypeStats[post.type].posts.push(post);
      contentTypeStats[post.type].engagement.push(
        (post.likes + post.comments) / (post.reach || 1)
      );
    });

    const timing = this.analyzePostTiming(posts);

    return {
      performance: {
        engagement: this.calculateStatistics(engagementRates),
        reach: this.calculateStatistics(reachRates),
        conversion: this.calculateStatistics(conversionRates)
      },
      contentTypes: Object.fromEntries(
        Object.entries(contentTypeStats).map(([type, stats]) => [
          type,
          {
            frequency: stats.posts.length / posts.length,
            effectiveness: this.calculateStatistics(stats.engagement),
            impact: this.calculateImpactScore(stats.posts)
          }
        ])
      ),
      timing: {
        optimal: timing.optimal,
        analysis: this.calculateStatistics(timing.scores)
      }
    };
  }

  private calculateCorrelation(timestamps: number[], values: number[]): number {
    // Pearson correlation coefficient calculation
    const n = timestamps.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = timestamps.reduce((a, b) => a + b * b, 0);
    const sumY2 = values.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectSeasonality(values: number[]): number {
    // Simple seasonality detection using autocorrelation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const normalized = values.map(v => v - mean);
    
    let maxCorrelation = 0;
    for (let lag = 1; lag <= Math.floor(values.length / 2); lag++) {
      const correlation = this.calculateAutocorrelation(normalized, lag);
      maxCorrelation = Math.max(maxCorrelation, Math.abs(correlation));
    }

    return maxCorrelation;
  }

  private calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length;
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += values[i] * values[i + lag];
    }
    return sum / (n - lag);
  }

  private calculateSignificance(values: number[]): number {
    // Calculate statistical significance using t-test
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const t = Math.abs(mean / Math.sqrt(variance / values.length));
    
    // Convert t-value to p-value (simplified)
    return 1 - (1 / (1 + Math.exp(-t)));
  }

  private predictGrowth(history: FollowersHistory[], days: number): number {
    const x = Array.from({ length: history.length }, (_, i) => i);
    const y = history.map(h => h.count);

    // Simple linear regression
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, x, i) => sum + x * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return intercept + slope * (x.length + days);
  }

  private calculateProjectionConfidence(values: number[]): number {
    // R-squared calculation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const totalSS = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
    
    const predicted = values.map((_, i) => {
      const x = Array.from({ length: values.length }, (_, j) => j);
      const y = values;
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, x, j) => sum + x * y[j], 0);
      const sumX2 = x.reduce((a, b) => a + b * b, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return intercept + slope * i;
    });
    
    const residualSS = values.reduce((a, b, i) => a + Math.pow(b - predicted[i], 2), 0);
    
    return 1 - (residualSS / totalSS);
  }

  private calculateImpactScore(posts: Post[]): number {
    return posts.reduce((score, post) => {
      const engagement = (post.likes + post.comments) / (post.reach || 1);
      const reach = post.reach || 0;
      const saves = post.saves || 0;
      return score + (engagement * reach * (1 + saves / 100)) / posts.length;
    }, 0);
  }

  private analyzePostTiming(posts: Post[]): {
    optimal: { dayOfWeek: string; timeOfDay: string; confidence: number };
    scores: number[];
  } {
    const timeSlots: Record<string, Record<string, number[]>> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    posts.forEach(post => {
      const timestamp = new Date(post.createdAt);
      const hour = timestamp.getHours();
      const day = days[timestamp.getDay()];
      const timeSlot = `${Math.floor(hour / 4) * 4}-${Math.floor(hour / 4) * 4 + 4}`;
      
      if (!timeSlots[day]) timeSlots[day] = {};
      if (!timeSlots[day][timeSlot]) timeSlots[day][timeSlot] = [];
      
      timeSlots[day][timeSlot].push(
        (post.likes + post.comments) / (post.reach || 1)
      );
    });

    let bestDay = '';
    let bestTime = '';
    let bestScore = 0;
    let bestConfidence = 0;
    const allScores: number[] = [];

    Object.entries(timeSlots).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([time, scores]) => {
        const stats = this.calculateStatistics(scores);
        const score = stats.mean;
        const confidence = 1 - stats.standardDeviation / stats.mean;
        
        allScores.push(...scores);
        
        if (score > bestScore || (score === bestScore && confidence > bestConfidence)) {
          bestDay = day;
          bestTime = time;
          bestScore = score;
          bestConfidence = confidence;
        }
      });
    });

    return {
      optimal: {
        dayOfWeek: bestDay,
        timeOfDay: bestTime,
        confidence: bestConfidence
      },
      scores: allScores
    };
  }
} 