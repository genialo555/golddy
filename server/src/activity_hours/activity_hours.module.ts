import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityHours } from './activity_hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityHours])],
  exports: [TypeOrmModule],
})
export class ActivityHoursModule {} 