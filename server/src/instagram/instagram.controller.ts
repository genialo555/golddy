import { Controller, Get, Post, Put, Body, Query, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { InstagramScraperService } from './services/scraper.service';
import { InstagramAnalyticsService } from './services/analytics.service';
import { InstagramHashtagService } from './services/hashtag.service';
import { InstagramCollaborationService } from './services/collaboration.service';
import { InstagramContentPerformanceService } from './services/content-performance.service';
import { HashtagPerformance } from './types/hashtag.types';
import { CollaborationInsights } from './types/collaboration.types';
import { ContentPerformanceAnalysis } from './types/content.types';
import { InstagramAudienceQualityService } from './services/audience-quality.service';
import { AudienceQualityScore } from './types/audience.types';
import { InstagramDataSyncService } from './services/data-sync.service';
import { InstagramGrowthPredictionService } from './services/growth-prediction.service';
import { InstagramBenchmarkService } from './services/benchmark.service';
import { InstagramTrendAnalysisService, TimeframeAnalysis } from './services/trend-analysis.service';
import { Benchmark } from '../benchmarks/benchmark.entity';
import { 
  InstagramStatisticalAnalysisService,
  EngagementAnalysis,
  GrowthAnalysis,
  ContentAnalysis
} from './services/statistical-analysis.service';
import { InstagramAudienceRecommendationService } from './services/audience-recommendation.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Recommendation } from '../recommendations/recommendation.entity';
import { AudienceRecommendation, RecommendationResponse } from './types/audience-recommendation.types';

@Controller('instagram')
export class InstagramController {
  constructor(
    private readonly scraperService: InstagramScraperService,
    private readonly analyticsService: InstagramAnalyticsService,
    private readonly hashtagService: InstagramHashtagService,
    private readonly collaborationService: InstagramCollaborationService,
    private readonly contentPerformanceService: InstagramContentPerformanceService,
    private readonly audienceQualityService: InstagramAudienceQualityService,
    private readonly dataSyncService: InstagramDataSyncService,
    private readonly growthPredictionService: InstagramGrowthPredictionService,
    private readonly benchmarkService: InstagramBenchmarkService,
    private readonly trendAnalysisService: InstagramTrendAnalysisService,
    private readonly statisticalAnalysisService: InstagramStatisticalAnalysisService,
    private readonly audienceRecommendationService: InstagramAudienceRecommendationService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Get('search')
  async searchUser(@Query('query') query: string) {
    return this.scraperService.searchUser(query);
  }

  @Get('user/info')
  async getUserInfo(@Query('username') username: string) {
    return this.scraperService.getUserInfo(username);
  }

  @Get('user/media')
  async getUserMedia(@Query('username') username: string) {
    return this.scraperService.getUserMedia(username);
  }

  @Get('user/followers')
  async getUserFollowers(@Query('username') username: string) {
    return this.scraperService.getUserFollowers(username);
  }

  @Get('analytics')
  async getAnalytics(@Query('username') username: string) {
    const data = await this.analyticsService.getCommunityInsights(username);
    return this.analyticsService.transformAnalytics(data);
  }

  @Get('hashtags/analysis')
  async analyzeHashtags(@Query('username') username: string): Promise<{
    topHashtags: HashtagPerformance[];
    totalAnalyzed: number;
    averageEngagement: number;
  }> {
    const performance = await this.hashtagService.analyzeHashtags(username);
    return {
      topHashtags: performance.slice(0, 10), // Return top 10 performing hashtags
      totalAnalyzed: performance.length,
      averageEngagement: performance.reduce((acc, curr) => acc + curr.engagementRate, 0) / performance.length
    };
  }

  @Get('collaborations/insights')
  async getCollaborationInsights(
    @Query('username') username: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<CollaborationInsights> {
    return this.collaborationService.getCollaborationInsights(
      username,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('collaborations')
  async createCollaboration(
    @Body() data: {
      userId: number;
      brandId: number;
      name: string;
      startDate: string;
      endDate: string;
      budget: number;
      goals: string[];
      requirements: string[];
    }
  ) {
    return this.collaborationService.createCollaboration(
      data.userId,
      data.brandId,
      {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: data.budget,
        goals: data.goals,
        requirements: data.requirements
      }
    );
  }

  @Put('collaborations/:id/status')
  async updateCollaborationStatus(
    @Param('id') id: number,
    @Body() data: {
      status: 'en cours' | 'terminée' | 'planifiée';
      feedback?: {
        rating: number;
        comment: string;
      };
    }
  ) {
    return this.collaborationService.updateCollaborationStatus(
      id,
      data.status,
      data.feedback
    );
  }

  @Get('audience/quality')
  async getAudienceQuality(@Query('username') username: string): Promise<{
    username: string;
    qualityScore: AudienceQualityScore;
    analyzedAt: Date;
  }> {
    const qualityScore = await this.audienceQualityService.analyzeAudienceQuality(username);
    return {
      username,
      qualityScore,
      analyzedAt: new Date()
    };
  }

  @Get('content/performance')
  async analyzeContentPerformance(
    @Query('userId') userId: string
  ): Promise<ContentPerformanceAnalysis> {
    return this.contentPerformanceService.analyzeContentPerformance(parseInt(userId, 10));
  }

  @Post('sync/:userId')
  async syncUserData(@Param('userId', ParseIntPipe) userId: number): Promise<{ message: string }> {
    await this.dataSyncService.syncUserData(userId);
    return { message: 'Data synchronization completed successfully' };
  }

  @Get('growth-prediction')
  async getGrowthPrediction(@Query('userId') userId: string) {
    return this.growthPredictionService.predictGrowth(parseInt(userId, 10));
  }

  @Get('benchmarks')
  async getBenchmarks(@Query('userId', ParseIntPipe) userId: number): Promise<Benchmark> {
    return this.benchmarkService.analyzeBenchmarks(userId);
  }

  @Get('trends')
  async analyzeTrends(@Query('userId') userId: string): Promise<TimeframeAnalysis> {
    return this.trendAnalysisService.analyzeTrends(parseInt(userId, 10));
  }

  @Get('statistics/engagement')
  async analyzeEngagementStatistics(@Query('userId') userId: string): Promise<EngagementAnalysis> {
    return this.statisticalAnalysisService.analyzeEngagement(parseInt(userId, 10));
  }

  @Get('statistics/growth')
  async analyzeGrowthStatistics(@Query('userId') userId: string): Promise<GrowthAnalysis> {
    return this.statisticalAnalysisService.analyzeGrowth(parseInt(userId, 10));
  }

  @Get('statistics/content')
  async analyzeContentStatistics(@Query('userId') userId: string): Promise<ContentAnalysis> {
    return this.statisticalAnalysisService.analyzeContent(parseInt(userId, 10));
  }

  @Get('recommendations/:username')
  async getRecommendations(@Param('username') username: string): Promise<AudienceRecommendation[]> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return this.audienceRecommendationService.generateRecommendations(user.id);
  }

  @Get('recommendations/:username/priority/:priority')
  async getRecommendationsByPriority(
    @Param('username') username: string,
    @Param('priority') priority: 'high' | 'medium' | 'low'
  ): Promise<Recommendation[]> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return this.audienceRecommendationService.getRecommendationsByPriority(user.id);
  }

  @Post('recommendations/:username/save')
  async saveRecommendations(
    @Param('username') username: string,
    @Body() recommendations: AudienceRecommendation[]
  ): Promise<Recommendation[]> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return this.audienceRecommendationService.saveRecommendations(user.id, recommendations);
  }

  @Get('recommendations/ml-insights')
  async getMlInsights(@Query('username') username: string) {
    const recommendations = await this.audienceRecommendationService.generateRecommendations(username);
    const mlRecommendations = recommendations.filter(rec => rec.mlInsights);
    
    return {
      username,
      timestamp: new Date(),
      insights: mlRecommendations.map(rec => ({
        type: rec.type,
        confidence: rec.mlInsights?.confidence ?? 0,
        predictedImprovement: rec.mlInsights?.predictedImprovement ?? 0,
        keyFactors: rec.mlInsights?.keyFactors ?? [],
        experimentalFeatures: rec.mlInsights?.experimentalFeatures ?? []
      }))
    };
  }

  @Get('recommendations/metrics')
  async getRecommendationMetrics(@Query('username') username: string) {
    const recommendations = await this.audienceRecommendationService.generateRecommendations(username);
    
    return {
      username,
      timestamp: new Date(),
      metrics: recommendations
        .filter(rec => rec.metrics)
        .map(rec => ({
          type: rec.type,
          metrics: rec.metrics ?? {},
          benchmarks: rec.metrics?.benchmarks ?? {}
        }))
    };
  }

  private groupRecommendationsByType(recommendations: any[]) {
    return recommendations.reduce((acc, rec) => {
      const type = rec.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
} 