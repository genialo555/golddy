import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrowthPrediction } from '../../growth-predictions/growth-prediction.entity';
import { FollowersHistory } from '../../followers_history/followers_history.entity';
import { User } from '../../user/user.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';
import { MoreThanOrEqual } from 'typeorm';

interface GrowthFactors {
  engagementRate: number;
  postFrequency: number;
  audienceQuality: number;
  contentQuality: number;
  seasonality: number;
  thirtyDayGrowth: number;
  ninetyDayGrowth: number;
  dataPoints: number;
  currentFollowers: number;
}

interface PredictionFactors {
  postFrequency: number;
  seasonality: number;
  thirtyDayGrowth: number;
  ninetyDayGrowth: number;
  contentQuality: number;
  dataPoints: number;
  currentFollowers: number;
}

@Injectable()
export class InstagramGrowthPredictionService {
  private readonly logger = new Logger(InstagramGrowthPredictionService.name);

  constructor(
    @InjectRepository(GrowthPrediction)
    private readonly growthPredictionRepository: Repository<GrowthPrediction>,
    @InjectRepository(FollowersHistory)
    private readonly followersHistoryRepository: Repository<FollowersHistory>,
    @InjectRepository(AudienceQuality)
    private readonly audienceQualityRepository: Repository<AudienceQuality>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async predictGrowth(userId: number): Promise<GrowthPrediction> {
    try {
      const [historicalData, audienceQuality] = await Promise.all([
        this.getHistoricalData(userId),
        this.getLatestAudienceQuality(userId)
      ]);

      const growthFactors = await this.analyzeGrowthFactors(historicalData, audienceQuality);
      const prediction = await this.calculatePrediction(historicalData, growthFactors);

      return this.savePrediction(userId, prediction, growthFactors);
    } catch (error) {
      this.logger.error(`Error predicting growth for user ${userId}:`, error.stack);
      throw error;
    }
  }

  private async getHistoricalData(userId: number): Promise<FollowersHistory[]> {
    return this.followersHistoryRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
      take: 90 // Last 90 days of data
    });
  }

  private async getLatestAudienceQuality(userId: number): Promise<AudienceQuality | null> {
    return this.audienceQualityRepository.findOne({
      where: { user: { id: userId } },
      order: { analyzedAt: 'DESC' }
    });
  }

  private async analyzeGrowthFactors(
    history: FollowersHistory[],
    audienceQuality: AudienceQuality | null
  ): Promise<GrowthFactors> {
    const firstRecord = history[0];
    const userId = firstRecord?.user?.id || 0;
    const currentFollowers = firstRecord?.count || 0;

    // Calculate engagement rate trend
    const engagementRate = audienceQuality?.engagementRate || 0;

    // Calculate post frequency (posts per day)
    const postFrequency = await this.calculatePostFrequency(userId);

    // Get audience quality score
    const audienceQualityScore = audienceQuality?.overallScore || 0;

    // Calculate content quality based on save and share rates
    const saveRate = audienceQuality?.saveRate || 0;
    const shareRate = audienceQuality?.shareRate || 0;
    const contentQuality = (saveRate + shareRate) / 2;

    // Calculate seasonality based on historical patterns
    const seasonality = this.calculateSeasonality(history);

    // Calculate growth rates
    const thirtyDayGrowth = this.calculateAverageGrowthRate(history, 30);
    const ninetyDayGrowth = this.calculateAverageGrowthRate(history, 90);

    return {
      engagementRate,
      postFrequency,
      audienceQuality: audienceQualityScore,
      contentQuality,
      seasonality,
      thirtyDayGrowth,
      ninetyDayGrowth,
      dataPoints: history.length,
      currentFollowers
    };
  }

  private calculateAverageGrowthRate(history: FollowersHistory[], days: number): number {
    if (history.length === 0) return 0;
    
    const relevantHistory = history.slice(0, days);
    return relevantHistory.reduce((sum, record) => sum + (record.growthRate || 0), 0) / 
      Math.min(relevantHistory.length, days);
  }

  private async calculatePostFrequency(userId: number): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const postCount = await this.growthPredictionRepository.manager
      .getRepository('posts')
      .count({
        where: {
          user: { id: userId },
          createdAt: MoreThanOrEqual(thirtyDaysAgo)
        }
      });

    return postCount / 30; // Average posts per day
  }

  private calculateSeasonality(history: FollowersHistory[]): number {
    if (history.length < 30) return 1;

    // Calculate average growth rate for each month
    const monthlyGrowth = new Map<number, number[]>();
    
    history.forEach(record => {
      const month = record.timestamp.getMonth();
      const growth = record.growthRate || 0;
      
      if (!monthlyGrowth.has(month)) {
        monthlyGrowth.set(month, []);
      }
      const monthGrowth = monthlyGrowth.get(month);
      if (monthGrowth) {
        monthGrowth.push(growth);
      }
    });

    // Calculate average growth rate for current month
    const currentMonth = new Date().getMonth();
    const currentMonthGrowth = monthlyGrowth.get(currentMonth) || [];
    const averageCurrentGrowth = currentMonthGrowth.length > 0
      ? currentMonthGrowth.reduce((a, b) => a + b, 0) / currentMonthGrowth.length
      : 1;

    // Return seasonality factor
    return averageCurrentGrowth > 0 ? averageCurrentGrowth : 1;
  }

  private async calculatePrediction(
    history: FollowersHistory[],
    factors: GrowthFactors
  ): Promise<{
    predictedFollowers: number;
    growthRate: number;
    confidenceScore: number;
  }> {
    if (!history.length) {
      return { predictedFollowers: 0, growthRate: 0, confidenceScore: 0 };
    }

    const currentFollowers = history[0].count;
    
    // Calculate base growth rate from historical data
    const averageGrowthRate = history
      .slice(0, 30) // Last 30 days
      .reduce((sum, record) => sum + (record.growthRate || 0), 0) / Math.min(history.length, 30);

    // Apply growth factors
    const adjustedGrowthRate = averageGrowthRate * (
      1 +
      (factors.engagementRate * 0.3) + // 30% weight to engagement
      (factors.postFrequency * 0.2) + // 20% weight to posting frequency
      (factors.audienceQuality * 0.2) + // 20% weight to audience quality
      (factors.contentQuality * 0.2) + // 20% weight to content quality
      (factors.seasonality * 0.1) // 10% weight to seasonality
    );

    // Predict followers for next 30 days
    const predictedFollowers = Math.round(
      currentFollowers * (1 + (adjustedGrowthRate / 100))
    );

    // Calculate confidence score based on data quality
    const confidenceScore = this.calculateConfidenceScore(
      history.length,
      factors,
      averageGrowthRate
    );

    return {
      predictedFollowers,
      growthRate: adjustedGrowthRate,
      confidenceScore
    };
  }

  private calculateConfidenceScore(
    dataPoints: number,
    factors: GrowthFactors,
    averageGrowthRate: number
  ): number {
    // Data quantity factor (max 0.3)
    const dataQuantityScore = Math.min(dataPoints / 90, 1) * 0.3;

    // Data quality factor (max 0.4)
    const dataQualityScore = (
      (factors.engagementRate > 0 ? 0.1 : 0) +
      (factors.postFrequency > 0 ? 0.1 : 0) +
      (factors.audienceQuality > 0 ? 0.1 : 0) +
      (factors.contentQuality > 0 ? 0.1 : 0)
    );

    // Growth stability factor (max 0.3)
    const growthStabilityScore = averageGrowthRate > 0 ? 0.3 : 0.15;

    return Math.round((dataQuantityScore + dataQualityScore + growthStabilityScore) * 100);
  }

  private async savePrediction(
    userId: number,
    prediction: {
      predictedFollowers: number;
      growthRate: number;
      confidenceScore: number;
    },
    factors: GrowthFactors
  ): Promise<GrowthPrediction> {
    const growthPrediction = new GrowthPrediction();
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    growthPrediction.user = user;
    growthPrediction.predictedFollowers = prediction.predictedFollowers;
    growthPrediction.growthRate = prediction.growthRate;
    growthPrediction.confidenceScore = prediction.confidenceScore;
    growthPrediction.factors = {
      postFrequency: factors.postFrequency,
      seasonality: factors.seasonality,
      thirtyDayGrowth: factors.thirtyDayGrowth,
      ninetyDayGrowth: factors.ninetyDayGrowth,
      contentQuality: factors.contentQuality,
      dataPoints: factors.dataPoints,
      currentFollowers: factors.currentFollowers
    } as PredictionFactors;

    return this.growthPredictionRepository.save(growthPrediction);
  }
} 