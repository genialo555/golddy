import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramScraperService } from './services/scraper.service';
import { InstagramAnalyticsService } from './services/analytics.service';
import { InstagramHashtagService } from './services/hashtag.service';
import { InstagramCollaborationService } from './services/collaboration.service';
import { InstagramContentPerformanceService } from './services/content-performance.service';
import { InstagramDataSyncService } from './services/data-sync.service';
import { InstagramGrowthPredictionService } from './services/growth-prediction.service';
import { InstagramBenchmarkService } from './services/benchmark.service';
import { InstagramController } from './instagram.controller';
import { instagramApiConfig } from './config/api.config';
import { InstagramAudienceQualityService } from './services/audience-quality.service';
import { InstagramStatisticalAnalysisService } from './services/statistical-analysis.service';
import { User } from '../user/user.entity';
import { FollowersHistory } from '../followers_history/followers_history.entity';
import { AudienceQuality } from '../audience_quality/audience_quality.entity';
import { Post } from '../posts/post.entity';
import { PostHashtag } from '../post_hashtags/post_hashtag.entity';
import { Location } from '../locations/location.entity';
import { Hashtag } from '../hashtags/hashtag.entity';
import { ActivityHours } from '../activity_hours/activity_hours.entity';
import { Demographics } from '../demographics/demographics.entity';
import { GrowthPrediction } from '../growth-predictions/growth-prediction.entity';
import { Benchmark } from '../benchmarks/benchmark.entity';
import { InstagramTrendAnalysisService } from './services/trend-analysis.service';
import { DataVersion } from './entities/data-version.entity';
import { InstagramAudienceRecommendationService } from './services/audience-recommendation.service';
import { InstagramBotDetectionService } from './services/bot-detection.service';
import { Recommendation } from '../recommendations/recommendation.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forFeature(instagramApiConfig),
    TypeOrmModule.forFeature([
      User,
      FollowersHistory,
      AudienceQuality,
      Post,
      PostHashtag,
      Location,
      Hashtag,
      ActivityHours,
      Demographics,
      GrowthPrediction,
      Benchmark,
      DataVersion,
      Recommendation
    ])
  ],
  controllers: [InstagramController],
  providers: [
    InstagramScraperService,
    InstagramAnalyticsService,
    InstagramHashtagService,
    InstagramCollaborationService,
    InstagramContentPerformanceService,
    InstagramAudienceQualityService,
    InstagramDataSyncService,
    InstagramGrowthPredictionService,
    InstagramBenchmarkService,
    InstagramTrendAnalysisService,
    InstagramStatisticalAnalysisService,
    InstagramAudienceRecommendationService,
    InstagramBotDetectionService
  ],
  exports: [
    InstagramScraperService,
    InstagramAnalyticsService,
    InstagramHashtagService,
    InstagramCollaborationService,
    InstagramContentPerformanceService,
    InstagramAudienceQualityService,
    InstagramDataSyncService,
    InstagramGrowthPredictionService,
    InstagramBenchmarkService,
    InstagramTrendAnalysisService,
    InstagramStatisticalAnalysisService,
    InstagramAudienceRecommendationService,
    InstagramBotDetectionService
  ]
})
export class InstagramModule {} 