import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrowthPrediction } from './growth-prediction.entity';
import { FollowersHistoryService } from '../followers_history/followers_history.service';
import { User } from '../user/user.entity';

@Injectable()
export class GrowthPredictionsService {
  constructor(
    @InjectRepository(GrowthPrediction)
    private readonly growthPredictionRepository: Repository<GrowthPrediction>,
    private readonly followersHistoryService: FollowersHistoryService,
  ) {}

  async generatePrediction(user: User): Promise<GrowthPrediction> {
    // Get historical growth rates
    const thirtyDayGrowth = await this.followersHistoryService.getGrowthRate(user.id, 30);
    const ninetyDayGrowth = await this.followersHistoryService.getGrowthRate(user.id, 90);
    
    // Get latest follower count
    const history = await this.followersHistoryService.getFollowersHistory(user.id);
    const currentFollowers = history[0]?.count || 0;

    // Calculate predicted growth
    const averageGrowthRate = (thirtyDayGrowth + ninetyDayGrowth) / 2;
    const predictedGrowth = (averageGrowthRate / 100) * currentFollowers;
    const predictedFollowers = Math.round(currentFollowers + predictedGrowth);

    // Calculate confidence score based on data consistency
    const confidenceScore = this.calculateConfidenceScore(thirtyDayGrowth, ninetyDayGrowth, history.length);

    const prediction = new GrowthPrediction();
    prediction.user = user;
    prediction.predictedFollowers = predictedFollowers;
    prediction.growthRate = averageGrowthRate;
    prediction.confidenceScore = confidenceScore;
    prediction.factors = {
      thirtyDayGrowth,
      ninetyDayGrowth,
      dataPoints: history.length,
      currentFollowers
    };

    return this.growthPredictionRepository.save(prediction);
  }

  private calculateConfidenceScore(
    thirtyDayGrowth: number,
    ninetyDayGrowth: number,
    dataPoints: number
  ): number {
    // Base confidence on:
    // 1. Consistency between short and long-term growth
    const growthDifference = Math.abs(thirtyDayGrowth - ninetyDayGrowth);
    const consistencyScore = Math.max(0, 1 - (growthDifference / 100));

    // 2. Amount of historical data available
    const dataScore = Math.min(1, dataPoints / 90); // Max score at 90 days of data

    // Weighted average of factors
    return (consistencyScore * 0.7 + dataScore * 0.3) * 100;
  }

  async getLatestPrediction(userId: number): Promise<GrowthPrediction | null> {
    return this.growthPredictionRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }
} 