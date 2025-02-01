import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './recommendation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recommendation])],
  exports: [TypeOrmModule],
})
export class RecommendationsModule {} 