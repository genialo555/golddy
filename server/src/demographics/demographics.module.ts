import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demographics } from './demographics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Demographics])],
  exports: [TypeOrmModule],
})
export class DemographicsModule {} 