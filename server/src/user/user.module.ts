// src/user/user.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { CollaborationsModule } from '../collaborations/collaborations.module';
import { PostsModule } from '../posts/posts.module';
import { SocialNetworkModule } from '../social_networks/social_networks.module';
import { NotificationPreferencesModule } from '../notification_preferences/notification_preferences.module';
import { AffinityScoresModule } from '../affinity_scores/affinity_scores.module';
import { KpiFinancierModule } from '../kpi_financiers/kpi_financiers.module';
import { FollowersModule } from '../followers/followers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => CollaborationsModule),
    forwardRef(() => PostsModule),
    forwardRef(() => SocialNetworkModule),
    forwardRef(() => NotificationPreferencesModule),
    forwardRef(() => AffinityScoresModule),
    forwardRef(() => KpiFinancierModule),
    forwardRef(() => FollowersModule),
  ],
  providers: [
    UserService,
    {
      provide: 'USER_REPOSITORY',
      useFactory: (repository: Repository<User>) => repository,
      inject: [getRepositoryToken(User)],
    },
  ],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
