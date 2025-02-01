import { Injectable, Logger } from '@nestjs/common';
import { InstagramBaseService } from './base.service';
import { 
  ContentType, 
  ContentTypePerformance, 
  TimePerformance,
  ContentPerformanceAnalysis,
  CaptionAnalysis,
  HashtagPerformance
} from '../types/content.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Post } from '../../posts/post.entity';
import { User } from '../../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

interface MetricsAccumulator {
  shares: number[];
  saves: number[];
  comments: number[];
  reach: number[];
}

interface Comment {
  text: string;
  timestamp: Date;
}

interface ViralityScore {
  score: number;
  factors: {
    shareRate: number;
    saveRate: number;
    commentVelocity: number;
    reachMultiplier: number;
  };
  isViral: boolean;
}

interface ContentSentiment {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
  };
}

interface EnhancedContentAnalysis {
  postId: number;
  type: string;
  performance: {
    engagement: number;
    reach: number;
    virality: ViralityScore;
  };
  sentiment: ContentSentiment;
  timing: {
    dayOfWeek: string;
    timeOfDay: string;
    isOptimalTime: boolean;
  };
  content: {
    captionQuality: number;
    hashtagEffectiveness: number;
    mediaQuality: number;
  };
}

@Injectable()
export class InstagramContentPerformanceService extends InstagramBaseService {
  protected readonly logger = new Logger(InstagramContentPerformanceService.name);
  private readonly VIRAL_THRESHOLD = 2.5;
  private readonly SENTIMENT_KEYWORDS = {
    positive: ['love', 'great', 'amazing', 'awesome', 'perfect', 'beautiful', 'best'],
    negative: ['bad', 'poor', 'terrible', 'worst', 'hate', 'disappointing']
  };
  private readonly CALL_TO_ACTION_KEYWORDS = [
    'click', 'tap', 'swipe', 'link', 'bio', 'check', 'follow', 'share',
    'comment', 'like', 'save', 'dm', 'message', 'subscribe'
  ];

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
    httpService: HttpService
  ) {
    super(configService, httpService);
  }

  async analyzeContentPerformance(userId: number): Promise<ContentPerformanceAnalysis> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const posts = await this.postRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: 50 // Analyze last 50 posts
      });

      const baselineMetrics = await this.calculateBaselineMetrics(userId);
      const contentTypePerformance = this.analyzeByContentType(posts, user.followersCount);
      const postingTimes = this.analyzePostingTimes(posts, user.followersCount);
      const hashtagPerformance = this.analyzeHashtags(posts, user.followersCount);
      const trends = this.analyzeTrends(posts, user.followersCount);
      const contentQuality = this.analyzeContentTypeStats(posts);
      const topPerformingPost = this.findTopPerformingPost(posts, user.followersCount);

      return {
        bestPerformingTypes: this.sortByEngagement(contentTypePerformance),
        bestPostingTimes: this.sortByEngagement(postingTimes),
        topHashtags: hashtagPerformance,
        overallStats: {
          totalPosts: posts.length,
          averageEngagement: this.calculateAverageEngagement(posts, user.followersCount),
          averageReach: this.calculateAverageReach(posts, user.followersCount),
          topPerformingPost,
          contentQuality
        },
        trends
      };
    } catch (error) {
      this.logger.error(`Error analyzing content performance: ${error.message}`);
      throw error;
    }
  }

  private async calculateBaselineMetrics(userId: number) {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 100 // Use last 100 posts for baseline
    });

    const metrics = posts.reduce<MetricsAccumulator>((acc, post) => {
      acc.shares.push(post.shares);
      acc.saves.push(post.saves);
      acc.comments.push(post.comments);
      acc.reach.push(post.insights?.reach || 0);
      return acc;
    }, { shares: [], saves: [], comments: [], reach: [] });

    return {
      averageShares: this.calculateMean(metrics.shares),
      averageSaves: this.calculateMean(metrics.saves),
      averageComments: this.calculateMean(metrics.comments),
      averageReach: this.calculateMean(metrics.reach),
      sharesStdDev: this.calculateStdDev(metrics.shares),
      savesStdDev: this.calculateStdDev(metrics.saves),
      commentsStdDev: this.calculateStdDev(metrics.comments),
      reachStdDev: this.calculateStdDev(metrics.reach)
    };
  }

  private async analyzePost(post: Post, baselineMetrics: any): Promise<EnhancedContentAnalysis> {
    const viralityScore = this.calculateViralityScore(post, baselineMetrics);
    const sentiment = await this.analyzeSentiment(post);
    const timing = this.analyzePostTiming(post);
    const contentQuality = this.analyzeContentQuality(post);

    return {
      postId: post.id,
      type: post.type,
      performance: {
        engagement: post.engagementRate,
        reach: post.reachRate,
        virality: viralityScore
      },
      sentiment,
      timing,
      content: contentQuality
    };
  }

  private calculateViralityScore(post: Post, baseline: any): ViralityScore {
    const shareRate = (post.shares - baseline.averageShares) / baseline.sharesStdDev;
    const saveRate = (post.saves - baseline.averageSaves) / baseline.savesStdDev;
    const commentVelocity = this.calculateCommentVelocity(post);
    const reachMultiplier = (post.insights?.reach || 0) / baseline.averageReach;

    const score = (
      shareRate * 0.4 +
      saveRate * 0.3 +
      commentVelocity * 0.2 +
      reachMultiplier * 0.1
    );

    return {
      score,
      factors: {
        shareRate,
        saveRate,
        commentVelocity,
        reachMultiplier
      },
      isViral: score > this.VIRAL_THRESHOLD
    };
  }

  private calculateCommentVelocity(post: Post): number {
    const hoursSincePosting = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    return post.comments / Math.max(1, hoursSincePosting);
  }

  private async analyzeSentiment(post: Post): Promise<ContentSentiment> {
    const comments = (post.insights?.comments || []) as Comment[];
    const sentimentScores = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    const keywords = {
      positive: new Set<string>(),
      negative: new Set<string>()
    };

    comments.forEach((comment: Comment) => {
      const words = comment.text.toLowerCase().split(/\s+/);
      let commentSentiment = 0;

      words.forEach((word: string) => {
        if (this.SENTIMENT_KEYWORDS.positive.includes(word)) {
          commentSentiment++;
          keywords.positive.add(word);
        } else if (this.SENTIMENT_KEYWORDS.negative.includes(word)) {
          commentSentiment--;
          keywords.negative.add(word);
        }
      });

      if (commentSentiment > 0) sentimentScores.positive++;
      else if (commentSentiment < 0) sentimentScores.negative++;
      else sentimentScores.neutral++;
    });

    const total = Object.values(sentimentScores).reduce((a, b) => a + b, 0) || 1;
    const score = (sentimentScores.positive - sentimentScores.negative) / total;

    return {
      overall: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
      score,
      breakdown: {
        positive: sentimentScores.positive / total,
        neutral: sentimentScores.neutral / total,
        negative: sentimentScores.negative / total
      },
      keywords: {
        positive: Array.from(keywords.positive),
        negative: Array.from(keywords.negative)
      }
    };
  }

  private analyzePostTiming(post: Post) {
    const date = new Date(post.createdAt);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    const timeOfDay = this.getTimeOfDay(hour);

    return {
      dayOfWeek,
      timeOfDay,
      isOptimalTime: this.isOptimalPostingTime(hour, dayOfWeek)
    };
  }

  private getTimeOfDay(hour: number): string {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private isOptimalPostingTime(hour: number, day: string): boolean {
    const optimalWindows = {
      weekday: [
        { start: 11, end: 13 }, // Lunch time
        { start: 19, end: 21 }  // After work
      ],
      weekend: [
        { start: 10, end: 14 }, // Late morning to afternoon
        { start: 17, end: 22 }  // Evening
      ]
    };

    const isWeekend = ['Saturday', 'Sunday'].includes(day);
    const windows = isWeekend ? optimalWindows.weekend : optimalWindows.weekday;

    return windows.some(window => hour >= window.start && hour <= window.end);
  }

  private analyzeContentQuality(post: Post) {
    return {
      captionQuality: this.calculateCaptionQuality(post),
      hashtagEffectiveness: this.calculateHashtagEffectiveness(post),
      mediaQuality: this.calculateMediaQuality(post)
    };
  }

  private calculateCaptionQuality(post: Post): number {
    const hasOptimalLength = post.captionLength >= 70 && post.captionLength <= 140;
    const hasEmojis = post.emojiCount > 0;
    const hasHashtags = post.hashtagCount > 0;
    const hasMentions = post.mentionCount > 0;
    const hasCallToAction = this.hasCallToAction(post.caption || '');

    return [
      hasOptimalLength,
      hasEmojis,
      hasHashtags,
      hasMentions,
      hasCallToAction
    ].filter(Boolean).length / 5;
  }

  private calculateHashtagEffectiveness(post: Post): number {
    const optimalHashtagCount = post.hashtagCount >= 5 && post.hashtagCount <= 15;
    const hasRelevantHashtags = post.hashtags?.some(tag => 
      tag.length > 4 && tag.length < 25
    );

    return [
      optimalHashtagCount,
      hasRelevantHashtags
    ].filter(Boolean).length / 2;
  }

  private calculateMediaQuality(post: Post): number {
    const hasHighResMedia = post.mediaUrl?.includes('high_resolution');
    const hasMultipleMedia = post.mediaType === 'carousel_album';
    const hasThumbnail = Boolean(post.thumbnailUrl);

    return [
      hasHighResMedia,
      hasMultipleMedia,
      hasThumbnail
    ].filter(Boolean).length / 3;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateStdDev(values: number[]): number {
    const mean = this.calculateMean(values);
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateMean(squareDiffs));
  }

  private analyzeCaptionQuality(caption: string): CaptionAnalysis {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
    const mentionRegex = /@[\w.]+/g;
    const hashtagRegex = /#[\w]+/g;

    const emojis = caption.match(emojiRegex) || [];
    const mentions = caption.match(mentionRegex) || [];
    const hashtags = caption.match(hashtagRegex) || [];

    const hasCallToAction = this.hasCallToAction(caption);
    const sentiment = this.analyzeCaptionSentiment(caption, emojis.length);

    return {
      length: caption.length,
      hasEmojis: emojis.length > 0,
      emojiCount: emojis.length,
      hashtagCount: hashtags.length,
      mentionCount: mentions.length,
      callToAction: hasCallToAction,
      sentiment,
      readabilityScore: this.calculateReadabilityScore(caption)
    };
  }

  private analyzeCaptionSentiment(text: string, emojiCount: number): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['love', 'great', 'amazing', 'awesome', 'happy', 'excited', 'best'];
    const negativeWords = ['bad', 'hate', 'worst', 'terrible', 'sad', 'disappointed'];

    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;

    const score = positiveCount - negativeCount + (emojiCount * 0.5);

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    if (words === 0 || sentences === 0) return 0;

    // Simplified Flesch Reading Ease calculation
    return Math.min(100, Math.max(0, 
      206.835 - 1.015 * (words / sentences) - 84.6 * (text.length / words)
    ));
  }

  private analyzeContentTypeStats(posts: any[]) {
    const captionLengths = posts.map(post => (post.caption || '').length);
    const emojiCounts = posts.map(post => 
      (post.caption || '').match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu)?.length || 0
    );
    const hashtagCounts = posts.map(post => 
      (post.caption || '').match(/#[\w]+/g)?.length || 0
    );
    const ctaCounts = posts.filter(post => 
      this.CALL_TO_ACTION_KEYWORDS.some(keyword => 
        (post.caption || '').toLowerCase().includes(keyword)
      )
    ).length;

    return {
      captionLength: {
        short: captionLengths.filter(len => len < 100).length,
        medium: captionLengths.filter(len => len >= 100 && len < 300).length,
        long: captionLengths.filter(len => len >= 300).length
      },
      emojiUsage: emojiCounts.reduce((a, b) => a + b, 0) / posts.length,
      hashtagUsage: {
        average: hashtagCounts.reduce((a, b) => a + b, 0) / posts.length,
        optimal: this.calculateOptimalHashtagCount(hashtagCounts, posts)
      },
      callToActionUsage: (ctaCounts / posts.length) * 100
    };
  }

  private calculateOptimalHashtagCount(hashtagCounts: number[], posts: any[]): number {
    // Find the hashtag count that correlates with highest engagement
    const engagementByCount = new Map<number, number>();
    
    posts.forEach((post, index) => {
      const count = hashtagCounts[index];
      const engagement = (post.likeCount || 0) + (post.commentsCount || 0);
      
      const current = engagementByCount.get(count) || 0;
      engagementByCount.set(count, current + engagement);
    });

    let bestCount = 0;
    let maxEngagement = 0;
    
    engagementByCount.forEach((totalEngagement, count) => {
      const postsWithCount = hashtagCounts.filter(c => c === count).length;
      const averageEngagement = totalEngagement / postsWithCount;
      
      if (averageEngagement > maxEngagement) {
        maxEngagement = averageEngagement;
        bestCount = count;
      }
    });

    return bestCount;
  }

  private analyzeTrends(posts: any[], followersCount: number) {
    // Sort posts by date
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Split posts into recent and older halves
    const midPoint = Math.floor(sortedPosts.length / 2);
    const recentPosts = sortedPosts.slice(0, midPoint);
    const olderPosts = sortedPosts.slice(midPoint);

    // Calculate engagement trends
    const recentEngagement = this.calculateAverageEngagement(recentPosts, followersCount);
    const olderEngagement = this.calculateAverageEngagement(olderPosts, followersCount);
    const engagementChange = ((recentEngagement - olderEngagement) / olderEngagement) * 100;

    // Calculate reach trends
    const recentReach = this.calculateAverageReach(recentPosts, followersCount);
    const olderReach = this.calculateAverageReach(olderPosts, followersCount);
    const reachChange = ((recentReach - olderReach) / olderReach) * 100;

    // Analyze content type improvement
    const contentImprovement = this.analyzeContentTypeImprovement(recentPosts, olderPosts, followersCount);

    return {
      engagement: {
        trend: this.determineTrend(engagementChange),
        percentage: Math.abs(engagementChange)
      },
      reach: {
        trend: this.determineTrend(reachChange),
        percentage: Math.abs(reachChange)
      },
      contentType: contentImprovement
    };
  }

  private determineTrend(change: number): 'up' | 'down' | 'stable' {
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private analyzeContentTypeImprovement(
    recentPosts: any[],
    olderPosts: any[],
    followersCount: number
  ) {
    const recentPerformance = this.analyzeByContentType(recentPosts, followersCount);
    const olderPerformance = this.analyzeByContentType(olderPosts, followersCount);

    let mostImproved: ContentType = ContentType.IMAGE;
    let maxImprovement = 0;

    recentPerformance.forEach(recent => {
      const older = olderPerformance.find(o => o.type === recent.type);
      if (older) {
        const improvement = ((recent.engagementRate - older.engagementRate) / older.engagementRate) * 100;
        if (improvement > maxImprovement) {
          maxImprovement = improvement;
          mostImproved = recent.type;
        }
      }
    });

    return {
      mostImproved,
      improvement: maxImprovement
    };
  }

  private analyzeByContentType(posts: any[], followersCount: number): ContentTypePerformance[] {
    const typeStats = new Map<ContentType, {
      totalEngagement: number;
      totalReach: number;
      totalLikes: number;
      totalComments: number;
      totalSaves: number;
      totalShares: number;
      count: number;
      captionLengths: number[];
      emojiCount: number;
      hashtagCount: number;
      mentionCount: number;
      ctaCount: number;
    }>();

    posts.forEach(post => {
      const type = this.determineContentType(post);
      const stats = typeStats.get(type) || {
        totalEngagement: 0,
        totalReach: 0,
        totalLikes: 0,
        totalComments: 0,
        totalSaves: 0,
        totalShares: 0,
        count: 0,
        captionLengths: [],
        emojiCount: 0,
        hashtagCount: 0,
        mentionCount: 0,
        ctaCount: 0
      };

      const caption = post.caption || '';
      const engagement = (post.likeCount || 0) + (post.commentsCount || 0);
      const emojiCount = (caption.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || []).length;
      const hashtagCount = (caption.match(/#[\w]+/g) || []).length;
      const mentionCount = (caption.match(/@[\w.]+/g) || []).length;
      const hasCallToAction = this.CALL_TO_ACTION_KEYWORDS.some(keyword => 
        caption.toLowerCase().includes(keyword)
      );
      
      typeStats.set(type, {
        totalEngagement: stats.totalEngagement + engagement,
        totalReach: stats.totalReach + (post.reach || 0),
        totalLikes: stats.totalLikes + (post.likeCount || 0),
        totalComments: stats.totalComments + (post.commentsCount || 0),
        totalSaves: stats.totalSaves + (post.saveCount || 0),
        totalShares: stats.totalShares + (post.shareCount || 0),
        count: stats.count + 1,
        captionLengths: [...stats.captionLengths, caption.length],
        emojiCount: stats.emojiCount + emojiCount,
        hashtagCount: stats.hashtagCount + hashtagCount,
        mentionCount: stats.mentionCount + mentionCount,
        ctaCount: stats.ctaCount + (hasCallToAction ? 1 : 0)
      });
    });

    return Array.from(typeStats.entries()).map(([type, stats]) => ({
      type,
      engagementRate: (stats.totalEngagement / (followersCount * stats.count)) * 100,
      reachRate: (stats.totalReach / (followersCount * stats.count)) * 100,
      averageLikes: stats.totalLikes / stats.count,
      averageComments: stats.totalComments / stats.count,
      averageSaves: stats.totalSaves / stats.count,
      averageShares: stats.totalShares / stats.count,
      totalPosts: stats.count,
      captionStats: {
        averageLength: stats.captionLengths.reduce((a, b) => a + b, 0) / stats.count,
        emojiUsage: stats.emojiCount / stats.count,
        hashtagUsage: stats.hashtagCount / stats.count,
        mentionUsage: stats.mentionCount / stats.count,
        callToActionUsage: (stats.ctaCount / stats.count) * 100
      }
    }));
  }

  private analyzePostingTimes(posts: any[], followersCount: number): TimePerformance[] {
    const timeStats = new Map<string, {
      totalEngagement: number;
      totalReach: number;
      count: number;
    }>();

    posts.forEach(post => {
      const postDate = new Date(post.createdAt);
      const timeKey = `${postDate.getDay()}-${postDate.getHours()}`;
      const stats = timeStats.get(timeKey) || {
        totalEngagement: 0,
        totalReach: 0,
        count: 0
      };

      const engagement = (post.likeCount || 0) + (post.commentsCount || 0);
      
      timeStats.set(timeKey, {
        totalEngagement: stats.totalEngagement + engagement,
        totalReach: stats.totalReach + (post.reach || 0),
        count: stats.count + 1
      });
    });

    return Array.from(timeStats.entries()).map(([timeKey, stats]) => {
      const [day, hour] = timeKey.split('-').map(Number);
      return {
        day: this.getDayName(day),
        hour,
        engagementRate: (stats.totalEngagement / (followersCount * stats.count)) * 100,
        reachRate: (stats.totalReach / (followersCount * stats.count)) * 100,
        totalPosts: stats.count
      };
    });
  }

  private determineContentType(post: any): ContentType {
    if (post.isIGTV) return ContentType.IGTV;
    if (post.isReel) return ContentType.REEL;
    if (post.mediaType === 'VIDEO') return ContentType.VIDEO;
    if (post.mediaType === 'CAROUSEL_ALBUM') return ContentType.CAROUSEL;
    return ContentType.IMAGE;
  }

  private findTopPerformingPost(posts: any[], followersCount: number) {
    return posts.reduce((top, post) => {
      const engagement = (post.likeCount || 0) + (post.commentsCount || 0);
      const engagementRate = (engagement / followersCount) * 100;

      if (!top || engagementRate > top.engagementRate) {
        return {
          id: post.id,
          type: this.determineContentType(post),
          engagementRate,
          likes: post.likeCount || 0,
          comments: post.commentsCount || 0,
          saves: post.saveCount || 0,
          shares: post.shareCount || 0
        };
      }
      return top;
    }, null);
  }

  private calculateAverageEngagement(posts: any[], followersCount: number): number {
    const totalEngagement = posts.reduce((sum, post) => 
      sum + ((post.likeCount || 0) + (post.commentsCount || 0)), 0);
    return (totalEngagement / (followersCount * posts.length)) * 100;
  }

  private calculateAverageReach(posts: any[], followersCount: number): number {
    const totalReach = posts.reduce((sum, post) => sum + (post.reach || 0), 0);
    return (totalReach / (followersCount * posts.length)) * 100;
  }

  private getDayName(day: number): string {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
  }

  private sortByEngagement<T extends { engagementRate: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => b.engagementRate - a.engagementRate);
  }

  private analyzeHashtags(posts: any[], followersCount: number): HashtagPerformance[] {
    const hashtagStats = new Map<string, {
      appearances: number;
      totalEngagement: number;
      totalReach: number;
      likes: number;
      comments: number;
      saves: number;
      shares: number;
    }>();

    posts.forEach(post => {
      const hashtags = this.extractHashtags(post.caption || '');
      const engagement = (post.likeCount || 0) + (post.commentsCount || 0);

      hashtags.forEach(tag => {
        const stats = hashtagStats.get(tag) || {
          appearances: 0,
          totalEngagement: 0,
          totalReach: 0,
          likes: 0,
          comments: 0,
          saves: 0,
          shares: 0
        };

        hashtagStats.set(tag, {
          appearances: stats.appearances + 1,
          totalEngagement: stats.totalEngagement + engagement,
          totalReach: stats.totalReach + (post.reach || 0),
          likes: stats.likes + (post.likeCount || 0),
          comments: stats.comments + (post.commentsCount || 0),
          saves: stats.saves + (post.saveCount || 0),
          shares: stats.shares + (post.shareCount || 0)
        });
      });
    });

    return Array.from(hashtagStats.entries())
      .map(([tag, stats]) => ({
        tag,
        frequency: (stats.appearances / posts.length) * 100,
        engagementRate: (stats.totalEngagement / (followersCount * stats.appearances)) * 100,
        reachRate: (stats.totalReach / (followersCount * stats.appearances)) * 100,
        totalPosts: stats.appearances,
        performance: {
          likes: stats.likes / stats.appearances,
          comments: stats.comments / stats.appearances,
          saves: stats.saves / stats.appearances,
          shares: stats.shares / stats.appearances
        }
      }))
      .sort((a, b) => b.engagementRate - a.engagementRate);
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  private hasCallToAction(caption: string): boolean {
    return this.CALL_TO_ACTION_KEYWORDS.some(keyword => 
      caption.toLowerCase().includes(keyword.toLowerCase())
    );
  }
} 