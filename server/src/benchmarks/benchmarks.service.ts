import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benchmark, BenchmarkCategory, InfluencerTier } from './benchmark.entity';

@Injectable()
export class BenchmarksService {
  private readonly logger = new Logger(BenchmarksService.name);

  constructor(
    @InjectRepository(Benchmark)
    private readonly benchmarkRepository: Repository<Benchmark>,
  ) {}

  async getBenchmarks(
    category: BenchmarkCategory,
    influencerTier: InfluencerTier,
    niche?: string
  ): Promise<Benchmark[]> {
    const query = this.benchmarkRepository.createQueryBuilder('benchmark')
      .where('benchmark.category = :category', { category })
      .andWhere('benchmark.influencerTier = :influencerTier', { influencerTier });

    if (niche) {
      query.andWhere('benchmark.niche = :niche', { niche });
    }

    return query.getMany();
  }

  async updateBenchmarks(data: {
    category: BenchmarkCategory;
    influencerTier: InfluencerTier;
    niche: string;
    averageValue: number;
    medianValue: number;
    topPerformerValue: number;
    additionalMetrics?: {
      engagementRate?: number;
      reachRate?: number;
      conversionRate?: number;
      growthRate?: number;
      commentRate?: number;
      saveRate?: number;
    };
    sampleSize: number;
  }): Promise<Benchmark> {
    const existing = await this.benchmarkRepository.findOne({
      where: {
        category: data.category,
        influencerTier: data.influencerTier,
        niche: data.niche
      }
    });

    if (existing) {
      Object.assign(existing, data);
      return this.benchmarkRepository.save(existing);
    }

    const benchmark = this.benchmarkRepository.create(data);
    return this.benchmarkRepository.save(benchmark);
  }

  async calculateBenchmarksFromData(
    category: BenchmarkCategory,
    data: number[],
    metadata: {
      influencerTier: InfluencerTier;
      niche: string;
      additionalMetrics?: {
        engagementRate?: number;
        reachRate?: number;
        conversionRate?: number;
        growthRate?: number;
        commentRate?: number;
        saveRate?: number;
      };
    }
  ): Promise<Benchmark> {
    const sortedData = [...data].sort((a, b) => a - b);
    const averageValue = data.reduce((a, b) => a + b) / data.length;
    const medianValue = this.calculateMedian(sortedData);
    const topPerformerValue = sortedData[Math.floor(sortedData.length * 0.9)]; // 90th percentile

    return this.updateBenchmarks({
      category,
      influencerTier: metadata.influencerTier,
      niche: metadata.niche,
      averageValue,
      medianValue,
      topPerformerValue,
      additionalMetrics: metadata.additionalMetrics,
      sampleSize: data.length
    });
  }

  private calculateMedian(sortedData: number[]): number {
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 !== 0
      ? sortedData[mid]
      : (sortedData[mid - 1] + sortedData[mid]) / 2;
  }
} 