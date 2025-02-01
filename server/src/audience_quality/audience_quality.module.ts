import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudienceQuality } from './audience_quality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AudienceQuality])],
  exports: [TypeOrmModule],
})
export class AudienceQualityModule {} 