import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostsModule } from './posts/posts.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { SocialNetworkModule } from './social_networks/social_networks.module';
import { AffinityScoresModule } from './affinity_scores/affinity_scores.module';
import { KpiFinancierModule } from './kpi_financiers/kpi_financiers.module';
import { FollowersModule } from './followers/followers.module';
import { InstagramModule } from './instagram/instagram.module';
import { LocationsModule } from './locations/locations.module';
import { PostHashtagsModule } from './post_hashtags/post_hashtags.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { BrandsModule } from './brands/brands.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ActivityHoursModule } from './activity_hours/activity_hours.module';
import { AudienceQualityModule } from './audience_quality/audience_quality.module';
import { FollowersHistoryModule } from './followers_history/followers_history.module';
import { GrowthPredictionsModule } from './growth-predictions/growth-predictions.module';
import { DemographicsModule } from './demographics/demographics.module';
import { BenchmarksModule } from './benchmarks/benchmarks.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CommonModule } from './common/common.module';
import { webcrypto } from 'crypto';
global.crypto = webcrypto as any;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: {
          rejectUnauthorized: false
        }
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    CommonModule,
    UserModule,
    AuthModule,
    PostsModule,
    CollaborationsModule,
    SocialNetworkModule,
    AffinityScoresModule,
    KpiFinancierModule,
    FollowersModule,
    InstagramModule,
    LocationsModule,
    PostHashtagsModule,
    HashtagsModule,
    BrandsModule,
    FeedbackModule,
    ActivityHoursModule,
    AudienceQualityModule,
    FollowersHistoryModule,
    GrowthPredictionsModule,
    DemographicsModule,
    BenchmarksModule,
    MarketplacesModule,
    IntegrationsModule,
    NotificationsModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
