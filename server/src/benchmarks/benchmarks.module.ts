import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benchmark } from './benchmark.entity';
import { BenchmarksService } from './benchmarks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Benchmark])],
  providers: [BenchmarksService],
  exports: [BenchmarksService],
})
export class BenchmarksModule {} 