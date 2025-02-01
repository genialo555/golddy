import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Benchmark } from '../../benchmarks/benchmark.entity';
import { User } from '../../user/user.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';
import { Post } from '../../posts/post.entity';
import { InstagramScraperService } from './scraper.service';

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

@Injectable()
export class InstagramBenchmarkService {
  private readonly logger = new Logger(InstagramBenchmarkService.name);

  constructor(
    @InjectRepository(Benchmark)
    private readonly benchmarkRepository: Repository<Benchmark>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AudienceQuality)
    private readonly audienceQualityRepository: Repository<AudienceQuality>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly scraperService: InstagramScraperService
  ) {}

  async analyzeBenchmarks(userId: number): Promise<Benchmark> {
    try {
      const user = await this.userRepository.findOne({ 
        where: { id: userId },
        relations: ['audienceQualities', 'posts']
      });

      if (!user) {
        throw new Error('User not found');
      }

      const [industryMetrics, competitors] = await Promise.all([
        this.getIndustryMetrics(user.industry),
        this.analyzeCompetitors(user)
      ]);

      const benchmark = new Benchmark();
      benchmark.user = user;
      benchmark.industryMetrics = industryMetrics;
      benchmark.competitorMetrics = competitors;
      benchmark.performanceScore = await this.calculatePerformanceScore(user, industryMetrics, competitors);
      benchmark.recommendations = await this.generateRecommendations(user, industryMetrics, competitors);

      return this.benchmarkRepository.save(benchmark);
    } catch (error) {
      this.logger.error(`Error analyzing benchmarks for user ${userId}:`, error.stack);
      throw error;
    }
  }

  private async getIndustryMetrics(industry: string): Promise<IndustryMetrics> {
    // Get all users in the same industry
    const users = await this.userRepository.find({
      where: { industry },
      relations: ['audienceQualities', 'posts']
    });

    const metrics = {
      engagementRates: [] as number[],
      reachRates: [] as number[],
      followerGrowth: [] as number[],
      postFrequencies: [] as number[],
      hashtags: new Map<string, number>(),
      postingTimes: new Map<string, number>(),
      contentTypes: new Map<string, number>()
    };

    // Collect metrics from all users
    for (const user of users) {
      const qualities = await user.audienceQualities;
      const latestQuality = qualities.length > 0 ? qualities[0] : null;
      
      if (latestQuality) {
        metrics.engagementRates.push(latestQuality.engagementRate);
        metrics.reachRates.push(latestQuality.reachEfficiency);
      }

      const posts = await user.posts;
      // Analyze posts
      posts.forEach(post => {
        // Track content types
        metrics.contentTypes.set(
          post.type,
          (metrics.contentTypes.get(post.type) || 0) + 1
        );

        // Track posting times
        const hour = post.createdAt.getHours().toString().padStart(2, '0');
        metrics.postingTimes.set(
          hour,
          (metrics.postingTimes.get(hour) || 0) + 1
        );

        // Track hashtags
        if (post.hashtags) {
          post.hashtags.forEach(hashtag => {
            metrics.hashtags.set(
              hashtag,
              (metrics.hashtags.get(hashtag) || 0) + 1
            );
          });
        }
      });

      // Calculate post frequency
      if (posts.length > 0) {
        const daysSinceFirstPost = (Date.now() - posts[0].createdAt.getTime()) / (1000 * 60 * 60 * 24);
        metrics.postFrequencies.push(posts.length / daysSinceFirstPost);
      }
    }

    // Calculate averages and find top values
    return {
      averageEngagementRate: this.calculateAverage(metrics.engagementRates),
      averageReachRate: this.calculateAverage(metrics.reachRates),
      averageFollowerGrowth: this.calculateAverage(metrics.followerGrowth),
      averagePostFrequency: this.calculateAverage(metrics.postFrequencies),
      topHashtags: Array.from(metrics.hashtags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag),
      bestPostingTimes: Array.from(metrics.postingTimes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([time]) => time),
      contentTypeDistribution: Object.fromEntries(metrics.contentTypes)
    };
  }

  private async analyzeCompetitors(user: User): Promise<CompetitorMetrics[]> {
    // Find competitors in the same industry with similar follower count range
    const competitors = await this.userRepository.find({
      where: {
        industry: user.industry,
        id: Not(user.id)
      },
      relations: ['audienceQualities', 'posts']
    });

    const results = await Promise.all(
      competitors.slice(0, 5).map(async competitor => {
        const qualities = await competitor.audienceQualities;
        const latestQuality = qualities.length > 0 ? qualities[0] : null;
        const posts = await competitor.posts;
        const daysSinceFirstPost = posts.length > 0 
          ? (Date.now() - posts[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)
          : 1;

        return {
          username: competitor.instagramUsername,
          followerCount: latestQuality?.metrics?.totalFollowers || 0,
          engagementRate: latestQuality?.engagementRate || 0,
          postFrequency: posts.length / daysSinceFirstPost,
          contentQuality: this.calculateContentQuality(posts),
          growthRate: latestQuality ? this.calculateGrowthRate(qualities) : 0
        };
      })
    );

    return results;
  }

  private calculateContentQuality(posts: Post[]): number {
    if (!posts.length) return 0;

    return posts.reduce((sum, post) => {
      const engagement = (post.likes + post.comments + post.saves + post.shares) / 4;
      return sum + engagement;
    }, 0) / posts.length;
  }

  private calculateGrowthRate(qualities: AudienceQuality[]): number {
    if (qualities.length < 2) return 0;

    const latest = qualities[0];
    const previous = qualities[1];
    
    if (!latest?.metrics?.totalFollowers || !previous?.metrics?.totalFollowers) {
      return 0;
    }

    return ((latest.metrics.totalFollowers - previous.metrics.totalFollowers) / 
      previous.metrics.totalFollowers) * 100;
  }

  private async calculatePerformanceScore(
    user: User,
    industryMetrics: IndustryMetrics,
    competitors: CompetitorMetrics[]
  ): Promise<number> {
    const qualities = await user.audienceQualities;
    const latestQuality = qualities.length > 0 ? qualities[0] : null;
    if (!latestQuality) return 0;

    // Calculate relative scores (0-1) for each metric
    const engagementScore = latestQuality.engagementRate / industryMetrics.averageEngagementRate;
    const reachScore = latestQuality.reachEfficiency / industryMetrics.averageReachRate;
    const growthScore = this.calculateGrowthRate(qualities) / industryMetrics.averageFollowerGrowth;
    
    // Calculate competitor ranking (0-1)
    const competitorMetrics = competitors.map(c => ({
      engagement: c.engagementRate,
      growth: c.growthRate
    }));
    const competitorScore = this.calculateCompetitorRanking(
      { 
        engagement: latestQuality.engagementRate,
        growth: this.calculateGrowthRate(qualities)
      },
      competitorMetrics
    );

    // Weighted average of all scores
    return Math.round(
      (engagementScore * 0.3 +
      reachScore * 0.2 +
      growthScore * 0.3 +
      competitorScore * 0.2) * 100
    );
  }

  private calculateCompetitorRanking(
    userMetrics: { engagement: number; growth: number },
    competitorMetrics: Array<{ engagement: number; growth: number }>
  ): number {
    const allMetrics = [userMetrics, ...competitorMetrics];
    const userRank = allMetrics.sort((a, b) => {
      const aScore = a.engagement * 0.6 + a.growth * 0.4;
      const bScore = b.engagement * 0.6 + b.growth * 0.4;
      return bScore - aScore;
    }).findIndex(m => m === userMetrics);

    return (allMetrics.length - userRank) / allMetrics.length;
  }

  private async generateRecommendations(
    user: User,
    industryMetrics: IndustryMetrics,
    competitors: CompetitorMetrics[]
  ): Promise<string[]> {
    const recommendations: string[] = [];
    const qualities = await user.audienceQualities;
    const latestQuality = qualities.length > 0 ? qualities[0] : null;
    const posts = await user.posts;

    if (!latestQuality) return recommendations;

    // Engagement recommendations
    if (latestQuality.engagementRate < industryMetrics.averageEngagementRate) {
      recommendations.push(
        'Your engagement rate is below industry average. Consider using more trending hashtags and posting at optimal times.'
      );
    }

    // Posting frequency recommendations
    const userPostFrequency = posts.length > 0
      ? posts.length / ((Date.now() - posts[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    if (userPostFrequency < industryMetrics.averagePostFrequency) {
      recommendations.push(
        'Increase your posting frequency to match industry average of ' +
        `${Math.round(industryMetrics.averagePostFrequency * 10) / 10} posts per day.`
      );
    }

    // Content type recommendations
    if (industryMetrics.contentTypeDistribution) {
      const contentTypes = Object.entries(industryMetrics.contentTypeDistribution);
      if (contentTypes.length > 0) {
        const [topContentType] = contentTypes.sort((a, b) => b[1] - a[1])[0];
        recommendations.push(
          `${topContentType} content performs best in your industry. Consider creating more of this type of content.`
        );
      }
    }

    // Best posting times
    if (industryMetrics.bestPostingTimes.length > 0) {
      recommendations.push(
        'Optimal posting times in your industry are: ' +
        industryMetrics.bestPostingTimes.map(time => `${time}:00`).join(', ')
      );
    }

    return recommendations;
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 
      ? numbers.reduce((a, b) => a + b, 0) / numbers.length 
      : 0;
  }
} 