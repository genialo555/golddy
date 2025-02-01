import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { FollowersHistory } from '../../followers_history/followers_history.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';
import { Post } from '../../posts/post.entity';
import { PostHashtag } from '../../post_hashtags/post_hashtag.entity';
import { Location } from '../../locations/location.entity';
import { ActivityHours } from '../../activity_hours/activity_hours.entity';
import { Demographics } from '../../demographics/demographics.entity';
import { InstagramContentPerformanceService } from './content-performance.service';
import { InstagramAudienceQualityService } from './audience-quality.service';
import { InstagramScraperService } from './scraper.service';
import { ContentType } from '../types/content.types';
import { Hashtag } from '../../hashtags/hashtag.entity';
import { InstagramGrowthPredictionService } from './growth-prediction.service';
import { InstagramBenchmarkService } from './benchmark.service';
import { Benchmark } from '../../benchmarks/benchmark.entity';
import { InstagramPost, InstagramPostLocation } from '../types/post.types';
import { DataVersion } from '../entities/data-version.entity';
import { DataChange } from '../types/sync.types';

interface BatchProcessingOptions {
  batchSize: number;
  concurrency: number;
  retryAttempts: number;
  retryDelay: number;
}

@Injectable()
export class InstagramDataSyncService {
  private readonly logger = new Logger(InstagramDataSyncService.name);
  private readonly DEFAULT_BATCH_OPTIONS: BatchProcessingOptions = {
    batchSize: 50,
    concurrency: 3,
    retryAttempts: 3,
    retryDelay: 1000
  };

  // Validation constants
  private readonly METRIC_RANGES = {
    engagementRate: { min: 0, max: 100 },
    reachRate: { min: 0, max: 100 },
    followers: { min: 0, max: 1000000000 },
    likes: { min: 0, max: 1000000 },
    comments: { min: 0, max: 1000000 },
    shares: { min: 0, max: 1000000 },
    saves: { min: 0, max: 1000000 },
    latitude: { min: -90, max: 90 },
    longitude: { min: -180, max: 180 }
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FollowersHistory)
    private readonly followersHistoryRepository: Repository<FollowersHistory>,
    @InjectRepository(AudienceQuality)
    private readonly audienceQualityRepository: Repository<AudienceQuality>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostHashtag)
    private readonly postHashtagRepository: Repository<PostHashtag>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(ActivityHours)
    private readonly activityHoursRepository: Repository<ActivityHours>,
    @InjectRepository(Demographics)
    private readonly demographicsRepository: Repository<Demographics>,
    @InjectRepository(Benchmark)
    private readonly benchmarkRepository: Repository<Benchmark>,
    private readonly contentPerformanceService: InstagramContentPerformanceService,
    private readonly audienceQualityService: InstagramAudienceQualityService,
    private readonly scraperService: InstagramScraperService,
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
    private readonly growthPredictionService: InstagramGrowthPredictionService,
    private readonly benchmarkService: InstagramBenchmarkService,
    @InjectRepository(DataVersion)
    private readonly dataVersionRepository: Repository<DataVersion>,
  ) {}

  async syncUserData(userId: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.instagramUsername) {
        throw new BadRequestException('User not found or Instagram username not set');
      }

      // Validate user data before proceeding
      this.validateUserData(user);

      const syncTasks = [
        this.syncContentPerformance(user),
        this.syncAudienceQuality(user),
        this.syncFollowersHistory(user),
        this.syncUserPosts(user),
        this.syncActivityHours(user),
        this.syncDemographics(user),
        this.syncGrowthPrediction(user),
        this.syncBenchmarks(user)
      ];

      const results = await Promise.allSettled(syncTasks);
      
      // Log any failed sync tasks
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(`Sync task ${index} failed:`, result.reason);
        }
      });

      // Throw error if all tasks failed
      if (results.every(result => result.status === 'rejected')) {
        throw new Error('All sync tasks failed');
      }
    } catch (error) {
      this.logger.error(`Error syncing data for user ${userId}:`, error.stack);
      throw error;
    }
  }

  private validateUserData(user: User): void {
    if (!user.instagramUsername?.trim()) {
      throw new BadRequestException('Instagram username is required');
    }
    if (user.followersCount < 0) {
      throw new BadRequestException('Invalid followers count');
    }
  }

  private validateMetric(value: number, metricName: keyof typeof this.METRIC_RANGES): number {
    const range = this.METRIC_RANGES[metricName];
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    return Math.min(Math.max(value, range.min), range.max);
  }

  private removeOutliers(values: number[]): number[] {
    if (values.length < 4) return values;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(value => value >= lowerBound && value <= upperBound);
  }

  private async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: Partial<BatchProcessingOptions> = {}
  ): Promise<R[]> {
    const batchOpts = { ...this.DEFAULT_BATCH_OPTIONS, ...options };
    const results: R[] = [];
    const chunks = this.chunkArray(items, batchOpts.batchSize);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (item) => {
        for (let attempt = 0; attempt < batchOpts.retryAttempts; attempt++) {
          try {
            const result = await processor(item);
            if (result) return result;
            throw new Error('Processor returned undefined result');
          } catch (error) {
            if (attempt === batchOpts.retryAttempts - 1) throw error;
            await this.delay(batchOpts.retryDelay * Math.pow(2, attempt));
          }
        }
      });

      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        } else if (result.status === 'rejected') {
          this.logger.error(
            `Failed to process item in batch: ${result.reason}`
          );
        }
      });
    }

    return results;
  }

  private async limitConcurrency<T>(
    promises: Promise<T>[],
    concurrency: number
  ): Promise<Promise<T>[]> {
    const executing = new Set<Promise<T>>();
    const results: Promise<T>[] = [];

    for (const promise of promises) {
      const execution = Promise.resolve().then(() => promise);
      executing.add(execution);

      const cleanup = () => executing.delete(execution);
      execution.then(cleanup, cleanup);

      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }

      results.push(execution);
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async trackChanges(
    user: User,
    entityType: DataChange['entityType'],
    entityId: string | number,
    changeType: DataChange['changeType'],
    fields?: string[],
    previousValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    const latestVersion = await this.dataVersionRepository.findOne({
      where: { user: { id: user.id } },
      order: { version: 'DESC' }
    });

    const version = new DataVersion();
    version.user = user;
    version.version = latestVersion ? latestVersion.version + 1 : 1;
    version.source = 'instagram';
    version.changes = [{
      entityType,
      entityId,
      changeType,
      fields,
      previousValues,
      newValues
    }];
    version.syncMetadata = {
      duration: 0,
      entityCounts: {},
      errors: []
    };

    await this.dataVersionRepository.save(version);
  }

  private async syncUserPosts(user: User): Promise<void> {
    const startTime = Date.now();
    const entityCounts = { created: 0, updated: 0, failed: 0 };
    const errors: Array<{ entityType: string; error: string; context?: any }> = [];

    const posts = await this.scraperService.getUserMedia(user.instagramUsername);
    
    await this.processBatch<InstagramPost, Post>(
      posts,
      async (postData) => {
        try {
          const existingPost = await this.postRepository.findOne({
            where: { externalId: postData.id }
          });

          const post = existingPost || new Post();
          post.externalId = postData.id;

          const previousValues = existingPost ? {
            likeCount: existingPost.likeCount,
            commentsCount: existingPost.commentsCount,
            shares: existingPost.shares,
            saves: existingPost.saves
          } : undefined;

          // Clean and validate metrics
          const cleanedData = {
            likeCount: this.validateMetric(postData.likeCount || 0, 'likes'),
            commentsCount: this.validateMetric(postData.commentsCount || 0, 'comments'),
            shares: this.validateMetric(postData.shares || 0, 'shares'),
            saves: this.validateMetric(postData.saves || 0, 'saves')
          };

          // Update post data with validated metrics
          Object.assign(post, {
            user,
            caption: this.sanitizeText(postData.caption),
            mediaType: postData.mediaType,
            mediaUrl: postData.mediaUrl,
            thumbnailUrl: postData.thumbnailUrl,
            permalink: postData.permalink,
            ...cleanedData,
            insights: this.validateInsights(postData.insights),
            instagramId: postData.id,
            createdAt: new Date(postData.createdAt || postData.timestamp),
            type: this.determineContentType(postData)
          });

          // Handle location if present
          if (postData.location) {
            await this.handleLocation(post, postData.location);
          }

          // Save post
          const savedPost = await this.postRepository.save(post);

          // Track changes
          await this.trackChanges(
            user,
            'post',
            savedPost.id,
            existingPost ? 'update' : 'create',
            Object.keys(cleanedData),
            previousValues,
            cleanedData
          );

          // Update counts
          if (!existingPost) {
            entityCounts.created++;
          } else {
            entityCounts.updated++;
          }

          // Handle hashtags
          if (postData.caption) {
            const hashtags = this.extractHashtags(postData.caption);
            await this.syncPostHashtags(savedPost, hashtags);
          }

          return savedPost;
        } catch (error) {
          entityCounts.failed++;
          errors.push({
            entityType: 'post',
            error: error.message,
            context: { postId: postData.id }
          });
          this.logger.error(`Error processing post ${postData.id}:`, error.stack);
          throw error;
        }
      },
      {
        batchSize: 10,
        concurrency: 3,
        retryAttempts: 3,
        retryDelay: 1000
      }
    );

    // Create version entry for the sync
    const version = new DataVersion();
    version.user = user;
    version.version = (await this.getLatestVersion(user)) + 1;
    version.source = 'instagram';
    version.changes = [];
    version.syncMetadata = {
      duration: Date.now() - startTime,
      entityCounts,
      errors
    };

    await this.dataVersionRepository.save(version);
  }

  private sanitizeText(text: string | undefined | null): string {
    if (!text) return '';
    // Remove any potential XSS or malicious content
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s#@]/g, '') // Remove special characters except # and @
      .trim();
  }

  private validateInsights(insights: any): any {
    if (!insights || typeof insights !== 'object') {
      return {};
    }

    return {
      reach: this.validateMetric(insights.reach || 0, 'reachRate'),
      engagement: this.validateMetric(insights.engagement || 0, 'engagementRate'),
      // ... other insight validations
    };
  }

  private async syncPostHashtags(post: Post, hashtags: string[]): Promise<void> {
    // Remove existing hashtags
    await this.postHashtagRepository.delete({ post: { id: post.id } });

    // Create new hashtags in batches
    await this.processBatch(
      hashtags,
      async (tag) => {
        const postHashtag = new PostHashtag();
        postHashtag.post = post;
        postHashtag.tag = tag;
        return this.postHashtagRepository.save(postHashtag);
      },
      {
        batchSize: 20,
        concurrency: 5
      }
    );
    
    // Update hashtag performance metrics
    await this.syncHashtagPerformance(post.user, post, hashtags);
  }

  private async syncHashtagPerformance(user: User, post: Post, hashtags: string[]): Promise<void> {
    for (const tagText of hashtags) {
      let hashtag = await this.hashtagRepository.findOne({
        where: { tag: tagText }
      });

      if (!hashtag) {
        hashtag = new Hashtag();
        hashtag.tag = tagText;
        hashtag.postCount = 1;
        hashtag.user = user;
      } else {
        hashtag.postCount += 1;
      }

      // Update performance metrics
      const engagement = post.likes + post.comments;
      const currentTotal = hashtag.engagementAverage * (hashtag.postCount - 1);
      hashtag.engagementAverage = (currentTotal + engagement) / hashtag.postCount;
      
      // Update frequency
      hashtag.frequency = await this.calculateHashtagFrequency(tagText, user.id);
      
      // Update performance score based on engagement and frequency
      hashtag.performanceScore = (hashtag.engagementAverage * hashtag.frequency) / 100;

      await this.hashtagRepository.save(hashtag);
    }
  }

  private async calculateHashtagFrequency(tag: string, userId: number): Promise<number> {
    const totalPosts = await this.postRepository.count({
      where: { user: { id: userId } }
    });

    const taggedPosts = await this.postHashtagRepository.count({
      where: { 
        tag,
        post: { user: { id: userId } }
      }
    });

    return totalPosts > 0 ? (taggedPosts / totalPosts) * 100 : 0;
  }

  private determineContentType(post: any): ContentType {
    if (post.isIGTV) return ContentType.IGTV;
    if (post.isReel) return ContentType.REEL;
    if (post.mediaType === 'VIDEO') return ContentType.VIDEO;
    if (post.mediaType === 'CAROUSEL_ALBUM') return ContentType.CAROUSEL;
    return ContentType.IMAGE;
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  private async syncContentPerformance(user: User): Promise<void> {
    const performance = await this.contentPerformanceService.analyzeContentPerformance(user.id);
    
    // Sync posts data
    for (const type of performance.bestPerformingTypes) {
      const post = new Post();
      post.user = user;
      post.type = type.type;
      post.engagementRate = type.engagementRate;
      post.reachRate = type.reachRate;
      post.likes = type.averageLikes;
      post.comments = type.averageComments;
      post.saves = type.averageSaves;
      post.shares = type.averageShares;
      post.captionLength = type.captionStats.averageLength;
      post.emojiCount = Math.round(type.captionStats.emojiUsage);
      post.hashtagCount = Math.round(type.captionStats.hashtagUsage);
      post.mentionCount = Math.round(type.captionStats.mentionUsage);
      post.hasCallToAction = type.captionStats.callToActionUsage > 50; // If more than 50% posts have CTA

      await this.postRepository.save(post);
    }

    // Save top performing post
    const topPost = performance.overallStats.topPerformingPost;
    const post = new Post();
    post.user = user;
    post.type = topPost.type;
    post.engagementRate = topPost.engagementRate;
    post.likes = topPost.likes;
    post.comments = topPost.comments;
    post.saves = topPost.saves;
    post.shares = topPost.shares;
    post.isTopPerforming = true;

    if (topPost.caption) {
      post.captionLength = topPost.caption.length;
      post.emojiCount = topPost.caption.emojiCount;
      post.hashtagCount = topPost.caption.hashtagCount;
      post.mentionCount = topPost.caption.mentionCount;
      post.hasCallToAction = topPost.caption.callToAction;
      post.sentiment = topPost.caption.sentiment;
    }

    await this.postRepository.save(post);
  }

  private async syncAudienceQuality(user: User): Promise<void> {
    const quality = await this.audienceQualityService.analyzeAudienceQuality(user.instagramUsername);
    
    const audienceQuality = new AudienceQuality();
    audienceQuality.user = user;
    audienceQuality.overallScore = quality.overallScore;
    audienceQuality.engagementRate = quality.engagementRate;
    audienceQuality.commentQuality = quality.commentQuality;
    audienceQuality.reachEfficiency = quality.reachEfficiency;
    audienceQuality.saveRate = quality.saveRate;
    audienceQuality.shareRate = quality.shareRate;

    // Structure benchmarks according to the required format
    audienceQuality.benchmarks = {
      industry: {
        engagementRate: quality.benchmarks.industry.engagementRate,
        reachRate: quality.benchmarks.industry.reachRate,
        saveRate: quality.benchmarks.industry.saveRate,
        shareRate: quality.benchmarks.industry.shareRate
      },
      similar: {
        engagementRate: quality.benchmarks.similar.engagementRate,
        reachRate: quality.benchmarks.similar.reachRate,
        saveRate: quality.benchmarks.similar.saveRate,
        shareRate: quality.benchmarks.similar.shareRate
      }
    };

    // Structure metrics according to the required format
    audienceQuality.metrics = {
      totalFollowers: quality.metrics.totalFollowers,
      averageLikes: quality.metrics.averageLikes,
      averageComments: quality.metrics.averageComments,
      averageSaves: quality.metrics.averageSaves,
      averageShares: quality.metrics.averageShares,
      averageReach: quality.metrics.averageReach,
      totalPosts: quality.metrics.totalPosts,
      followerGrowth: quality.metrics.followerGrowth
    };

    await this.audienceQualityRepository.save(audienceQuality);
  }

  private async syncFollowersHistory(user: User): Promise<void> {
    try {
      // Get the latest follower count
      const latestHistory = await this.followersHistoryRepository.findOne({
        where: { user: { id: user.id } },
        order: { timestamp: 'DESC' }
      });

      // Check if we need to update (hourly update)
      const shouldUpdate = !latestHistory || 
        (new Date().getTime() - latestHistory.timestamp.getTime()) > 60 * 60 * 1000;

      if (shouldUpdate) {
        // Get new follower count
        const followerCount = await this.getFollowerCount(user.instagramUsername);
        
        // Calculate metrics
        const gainedCount = latestHistory ? Math.max(0, followerCount - latestHistory.count) : 0;
        const lostCount = latestHistory ? Math.max(0, latestHistory.count - followerCount) : 0;
        const growthRate = latestHistory ? ((followerCount - latestHistory.count) / latestHistory.count) * 100 : 0;

        // Save new history
        const history = this.followersHistoryRepository.create({
          user,
          count: followerCount,
          gainedCount,
          lostCount,
          growthRate
        });

        await this.followersHistoryRepository.save(history);
      }
    } catch (error) {
      this.logger.error(`Error syncing followers history for user ${user.id}:`, error.stack);
      throw error;
    }
  }

  private async syncActivityHours(user: User): Promise<void> {
    const posts = await this.postRepository.find({
      where: { user: { id: user.id } },
      select: ['createdAt']
    });

    const hourCounts: { [hour: string]: number } = {};
    let maxCount = 0;

    // Initialize hours
    for (let i = 0; i < 24; i++) {
      hourCounts[i.toString().padStart(2, '0')] = 0;
    }

    // Count posts by hour
    posts.forEach(post => {
      const hour = post.createdAt.getHours().toString().padStart(2, '0');
      hourCounts[hour]++;
      maxCount = Math.max(maxCount, hourCounts[hour]);
    });

    // Calculate peak activity score
    const peakActivityScore = maxCount > 0 ? 
      Object.values(hourCounts).reduce((sum, count) => sum + (count / maxCount), 0) / 24 : 0;

    const activityHours = new ActivityHours();
    activityHours.user = user;
    activityHours.hours = hourCounts;
    activityHours.peakActivityScore = peakActivityScore;

    await this.activityHoursRepository.save(activityHours);
  }

  private async syncDemographics(user: User): Promise<void> {
    const audienceData = await this.scraperService.getAudienceInsights(user.instagramUsername);
    
    const demographics = new Demographics();
    demographics.user = user;
    
    // Map audience data to demographics entity
    demographics.ageDistribution = audienceData.ageRanges;
    demographics.genderDistribution = audienceData.genderDistribution;
    demographics.topCountries = audienceData.topCountries.map(country => ({
      country: country.name,
      percentage: country.percentage,
      count: Math.round((country.percentage * audienceData.totalFollowers) / 100)
    }));
    demographics.topCities = audienceData.topCities.map(city => ({
      city: city.name,
      country: city.country,
      percentage: city.percentage,
      count: Math.round((city.percentage * audienceData.totalFollowers) / 100)
    }));
    
    demographics.totalFollowers = audienceData.totalFollowers;
    demographics.engagementRate = audienceData.engagementRate;
    demographics.growthMetrics = {
      daily: audienceData.growthRate.daily,
      weekly: audienceData.growthRate.weekly,
      monthly: audienceData.growthRate.monthly,
      yearToDate: audienceData.growthRate.yearToDate
    };
    
    demographics.metrics = {
      reach: audienceData.reach,
      ageRanges: audienceData.ageRanges,
      topCities: audienceData.topCities,
      topCountries: audienceData.topCountries
    };

    await this.demographicsRepository.save(demographics);
  }

  private async syncGrowthPrediction(user: User): Promise<void> {
    await this.growthPredictionService.predictGrowth(user.id);
  }

  private async syncBenchmarks(user: User): Promise<void> {
    try {
      // Get the latest benchmark
      const latestBenchmark = await this.benchmarkRepository.findOne({
        where: { user: { id: user.id } },
        order: { createdAt: 'DESC' }
      });

      // Check if we need to update (daily update)
      const shouldUpdate = !latestBenchmark || 
        (new Date().getTime() - latestBenchmark.createdAt.getTime()) > 24 * 60 * 60 * 1000;

      if (shouldUpdate) {
        // Analyze new benchmarks
        const benchmark = await this.benchmarkService.analyzeBenchmarks(user.id);
        
        // Store historical data
        if (latestBenchmark) {
          benchmark.additionalMetrics = {
            ...benchmark.additionalMetrics,
            previousEngagementRate: latestBenchmark.additionalMetrics?.engagementRate,
            previousReachRate: latestBenchmark.additionalMetrics?.reachRate,
            previousGrowthRate: latestBenchmark.additionalMetrics?.growthRate,
            engagementRateChange: this.calculatePercentageChange(
              benchmark.additionalMetrics?.engagementRate,
              latestBenchmark.additionalMetrics?.engagementRate
            ),
            reachRateChange: this.calculatePercentageChange(
              benchmark.additionalMetrics?.reachRate,
              latestBenchmark.additionalMetrics?.reachRate
            ),
            growthRateChange: this.calculatePercentageChange(
              benchmark.additionalMetrics?.growthRate,
              latestBenchmark.additionalMetrics?.growthRate
            )
          };
        }

        await this.benchmarkRepository.save(benchmark);
      }
    } catch (error) {
      this.logger.error(`Error syncing benchmarks for user ${user.id}:`, error.stack);
      throw error;
    }
  }

  private calculatePercentageChange(current: number | undefined, previous: number | undefined): number {
    if (typeof current !== 'number' || typeof previous !== 'number' || previous === 0) {
      return 0;
    }
    return ((current - previous) / previous) * 100;
  }

  private async handleLocation(post: Post, locationData: InstagramPostLocation): Promise<void> {
    try {
      let location = await this.locationRepository.findOne({
        where: { externalId: locationData.id }
      });

      if (!location) {
        location = new Location();
        location.externalId = locationData.id;
        Object.assign(location, {
          name: this.sanitizeText(locationData.name),
          latitude: this.validateMetric(locationData.latitude || 0, 'latitude'),
          longitude: this.validateMetric(locationData.longitude || 0, 'longitude'),
          city: this.sanitizeText(locationData.city),
          address: this.sanitizeText(locationData.address),
          additionalInfo: {
            category: this.sanitizeText(locationData.category),
            website: this.sanitizeText(locationData.website),
            phone: this.sanitizeText(locationData.phone)
          }
        });
        location = await this.locationRepository.save(location);
      }

      post.location = location;
    } catch (error) {
      this.logger.error(`Error processing location for post ${post.id}:`, error.stack);
      // Don't throw error, just log it and continue without location
    }
  }

  private async getLatestVersion(user: User): Promise<number> {
    const latestVersion = await this.dataVersionRepository.findOne({
      where: { user: { id: user.id } },
      order: { version: 'DESC' }
    });
    return latestVersion?.version || 0;
  }

  private async getFollowerCount(username: string): Promise<number> {
    try {
      const userInfo = await this.scraperService.getUserInfo(username);
      return userInfo.followersCount || 0;
    } catch (error) {
      this.logger.error(`Error getting follower count for ${username}:`, error.stack);
      throw error;
    }
  }
} 