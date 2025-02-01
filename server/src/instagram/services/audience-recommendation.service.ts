import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../../recommendations/recommendation.entity';
import { User } from '../../user/user.entity';
import { InstagramBotDetectionService } from './bot-detection.service';
import * as tf from '@tensorflow/tfjs-node';
import { Logs } from '@tensorflow/tfjs-layers';
import { InstagramGrowthPredictionService } from './growth-prediction.service';
import { GrowthPrediction } from '../../growth-predictions/growth-prediction.entity';
import { AudienceQuality } from '../../audience_quality/audience_quality.entity';

// Base metrics interface
interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  timestamp: string;
}

// Extended metrics with advanced analytics
interface AdvancedEngagementMetrics extends EngagementMetrics {
  engagementRate: number;
  saveRate: number;
  shareRate: number;
  predictedEngagement: number;
  optimalPublishTime: Date;
  contentScore: number;
  audienceMatch: number;
}

// Separate interface for ML features
interface MLFeatures {
  // Growth metrics
  growthRate: number;
  postFrequency: number;
  seasonality: number;
  thirtyDayGrowth: number;
  ninetyDayGrowth: number;
  
  // Audience quality metrics
  audienceQualityScore: number;
  suspiciousAccountsPercentage: number;
  authenticEngagementRate: number;
  massFollowersPercentage: number;
  
  // Content metrics
  contentQuality: number;
  hashtagPerformance: number;
  postTiming: number;
  saveRate: number;
  shareRate: number;
  
  // Engagement metrics
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
}

// Separate interface for post features
interface PostFeatures {
  mediaType: string;
  hashtagCount: number;
  captionLength: number;
  postHour: number;
  postDay: number;
  previousEngagement: number[];
}

interface ContentPerformance {
  type: string;
  engagementRate: number;
  reachRate: number;
  saveRate: number;
  commentRate: number;
  averageTimeSpent: number;
}

interface TimingPerformance {
  dayOfWeek: string;
  hourOfDay: number;
  engagementRate: number;
  reachRate: number;
}

interface OptimizationMetrics {
  contentPerformance: ContentPerformance[];
  timingPerformance: TimingPerformance[];
  hashtagPerformance: {
    tag: string;
    engagementRate: number;
    reach: number;
  }[];
}

interface AudienceRecommendation {
  type: 'engagement' | 'growth' | 'quality' | 'security' | 'visibility' | 'content' | 'timing' | 'hashtags' | 'monetization' | 'business' | 'reels' | 'stories' | 'conversion' | 'collaboration';
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  details?: string;
  metrics?: {
    current?: number;
    target?: number;
    improvement?: number;
    history?: number[];
    trend?: 'increasing' | 'decreasing' | 'stable';
    benchmarks?: {
      industry?: number;
      similar_accounts?: number;
    };
    roi?: {
      potential: number;
      timeframe: string;
      confidence: number;
    };
  };
  implementation?: string[];
  mlInsights?: {
    confidence: number;
    predictedImprovement: number;
    keyFactors: string[];
    experimentalFeatures?: string[];
    audienceSegments?: {
      segment: string;
      size: number;
      engagementRate: number;
      conversionPotential: number;
    }[];
  };
  businessMetrics?: {
    conversionRate?: number;
    clickThroughRate?: number;
    averageOrderValue?: number;
    customerLifetimeValue?: number;
    returnOnAdSpend?: number;
  };
}

interface VisibilityContext {
  tourism_zones: string[];
  trending_topics: string[];
  peak_hours: number[];
  engagement_thresholds: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface Post {
  likes: number;
  comments: number;
  shares: number;
  caption: string;
  location?: string;
  timestamp: Date;
  mediaType?: string;
}

interface UserLocation {
  location?: string;
}

type VisibilityAlgorithm = (post: Post, userLocation: UserLocation, context: VisibilityContext) => number;

interface PredictionFactors {
  postFrequency: number;
  seasonality: number;
  thirtyDayGrowth: number;
  ninetyDayGrowth: number;
  contentQuality: number;
  dataPoints: number;
  currentFollowers: number;
}

interface AudienceQualityMetrics {
  overallScore: number;
  suspiciousAccountsPercentage: number;
  authenticEngagementRate: number;
  massFollowersPercentage: number;
  saveRate: number;
  shareRate: number;
}

interface ExtractedFeatures {
  mediaType: string;
  hashtagCount: number;
  captionLength: number;
  postHour: number;
  postDay: number;
  previousEngagement: number[];
}

interface TensorFlowPrediction {
  engagement: number;
  confidence: number;
  factors: { [key: string]: number };
}

interface EpochLogs extends Logs {
  loss: number;
  acc: number;
}

@Injectable()
export class AdvancedMLPredictor {
  private model: tf.LayersModel;
  private readonly logger = new Logger(AdvancedMLPredictor.name);

  constructor(
    private readonly growthPredictionService: InstagramGrowthPredictionService,
    private readonly botDetectionService: InstagramBotDetectionService
  ) {
    this.initializeModel();
  }

  private async initializeModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [15], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  async trainModel(userId: number): Promise<void> {
    try {
      // Get growth predictions
      const growthPrediction = await this.growthPredictionService.predictGrowth(userId);
      
      // Get audience quality metrics
      const audienceQuality = await this.botDetectionService.analyzeAudienceQuality(userId);

      // Combine features
      const features = await this.extractFeatures(userId, growthPrediction, audienceQuality);
      
      // Prepare training data
      const trainingData = tf.tensor2d([Object.values(features)]);
      const labels = tf.tensor2d([[this.calculateTargetLabel(features)]]);

      // Train the model
      await this.model.fit(trainingData, labels, {
        epochs: 50,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch: number, logs: Logs) => {
            this.logger.log(`Epoch ${epoch}: loss = ${logs.loss?.toFixed(4)}, accuracy = ${logs.acc?.toFixed(4)}`);
          }
        }
      });

      // Cleanup tensors
      trainingData.dispose();
      labels.dispose();

    } catch (error) {
      this.logger.error('Error training model:', error);
      throw error;
    }
  }

  private async extractFeatures(
    userId: number, 
    growthPrediction: GrowthPrediction, 
    audienceQuality: AudienceQualityMetrics
  ): Promise<MLFeatures> {
    const factors = growthPrediction.factors as unknown as PredictionFactors;
    
    return {
      // Growth metrics
      growthRate: growthPrediction.growthRate || 0,
      postFrequency: factors?.postFrequency || 0,
      seasonality: factors?.seasonality || 1,
      thirtyDayGrowth: factors?.thirtyDayGrowth || 0,
      ninetyDayGrowth: factors?.ninetyDayGrowth || 0,
      
      // Audience quality metrics
      audienceQualityScore: audienceQuality.overallScore || 0,
      suspiciousAccountsPercentage: audienceQuality.suspiciousAccountsPercentage || 0,
      authenticEngagementRate: audienceQuality.authenticEngagementRate || 0,
      massFollowersPercentage: audienceQuality.massFollowersPercentage || 0,
      
      // Content metrics
      contentQuality: factors?.contentQuality || 0,
      hashtagPerformance: await this.calculateHashtagScore(userId),
      postTiming: await this.calculateTimingScore(userId),
      saveRate: audienceQuality.saveRate || 0,
      shareRate: audienceQuality.shareRate || 0,
      
      // Engagement metrics
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      reach: 0,
      impressions: 0
    };
  }

  private extractPostFeatures(post: Post, historicalData: EngagementMetrics[]): ExtractedFeatures {
    const postDate = new Date(post.timestamp);
    const previousEngagement = historicalData
      .slice(-5)
      .map(data => (data.likes + data.comments + data.shares) / 3);

    return {
      mediaType: post.mediaType || 'image',
      hashtagCount: (post.caption.match(/#/g) || []).length,
      captionLength: post.caption.length,
      postHour: postDate.getHours(),
      postDay: postDate.getDay(),
      previousEngagement
    };
  }

  private calculateTargetLabel(features: MLFeatures): number {
    const weights = {
      growthRate: 0.2,
      audienceQuality: 0.2,
      contentQuality: 0.2,
      engagement: 0.2,
      sustainability: 0.2
    };

    const growthScore = (
      features.growthRate * 0.4 +
      features.thirtyDayGrowth * 0.3 +
      features.ninetyDayGrowth * 0.3
    );

    const audienceScore = (
      features.audienceQualityScore * 0.4 +
      (100 - features.suspiciousAccountsPercentage) * 0.3 +
      (100 - features.massFollowersPercentage) * 0.3
    ) / 100;

    const engagementScore = (
      features.authenticEngagementRate * 0.4 +
      features.saveRate * 0.3 +
      features.shareRate * 0.3
    );

    return (
      growthScore * weights.growthRate +
      audienceScore * weights.audienceQuality +
      features.contentQuality * weights.contentQuality +
      engagementScore * weights.engagement +
      features.seasonality * weights.sustainability
    ) / 100; // Normalize to 0-1
  }

  private async calculateHashtagScore(userId: number): Promise<number> {
    // TODO: Implement hashtag performance calculation
    return 0.5;
  }

  private async calculateTimingScore(userId: number): Promise<number> {
    // TODO: Implement posting time optimization
    return 0.5;
  }

  async predict(userId: number): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const growthPrediction = await this.growthPredictionService.predictGrowth(userId);
      const audienceQuality = await this.botDetectionService.analyzeAudienceQuality(userId);
      
      const features = await this.extractFeatures(userId, growthPrediction, audienceQuality);
      const inputTensor = tf.tensor2d([Object.values(features)]);
      
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const score = await prediction.data();
      
      inputTensor.dispose();
      prediction.dispose();

      return {
        score: score[0],
        confidence: growthPrediction.confidenceScore / 100,
        recommendations: this.generateRecommendations(features, score[0])
      };
    } catch (error) {
      this.logger.error('Error making prediction:', error);
      throw error;
    }
  }

  private generateRecommendations(features: MLFeatures, score: number): string[] {
    const recommendations: string[] = [];

    // Audience quality recommendations
    if (features.suspiciousAccountsPercentage > 20) {
      recommendations.push('Consider cleaning up suspicious followers to improve audience quality');
    }
    if (features.massFollowersPercentage > 15) {
      recommendations.push('High percentage of mass followers detected - focus on organic growth');
    }

    // Engagement recommendations
    if (features.authenticEngagementRate < 2) {
      recommendations.push('Focus on creating more engaging content to boost authentic engagement');
    }
    if (features.saveRate < 1) {
      recommendations.push('Create more saveable content (tutorials, guides, valuable information)');
    }
    if (features.shareRate < 1) {
      recommendations.push('Create more shareable content to increase reach');
    }

    // Growth recommendations
    if (features.postFrequency < 0.5) {
      recommendations.push('Increase posting frequency to maintain consistent growth');
    }
    if (features.thirtyDayGrowth < features.ninetyDayGrowth) {
      recommendations.push('Recent growth has slowed - consider revising content strategy');
    }

    // Content quality recommendations
    if (features.contentQuality < 0.6) {
      recommendations.push('Improve content quality by focusing on production value and storytelling');
    }
    if (features.seasonality < 0.8) {
      recommendations.push('Adjust content strategy to better align with seasonal trends');
    }

    return recommendations;
  }
}

interface ContentAnalysis {
  predictedEngagement: number;
  confidence: number;
  featureImportance: { [key: string]: number };
  recommendations: string[];
  optimizations: Optimization[];
}

interface Optimization {
  feature: string;
  importance: number;
  suggestion: string;
}

class EngagementPredictor {
  private readonly features = [
    'likes',
    'comments',
    'shares',
    'views',
    'mediaType',
    'hashtagCount',
    'captionLength',
    'postHour',
    'postDay',
    'previousEngagement'
  ];

  private calculateFeatureImportance(metrics: EngagementMetrics[]): Map<string, number> {
    const importance = new Map<string, number>();
    
    // Simplified feature importance calculation
    this.features.forEach(feature => {
      const score = Math.random(); // In real implementation, this would use actual ML metrics
      importance.set(feature, score);
    });

    return importance;
  }

  predictEngagement(post: Post, historicalData: EngagementMetrics[]): AdvancedEngagementMetrics {
    const features = this.extractFeatures(post, historicalData);
    const importance = this.calculateFeatureImportance(historicalData);
    
    // Calculate weighted engagement prediction
    const predictedEngagement = this.calculateWeightedEngagement(features, importance);
    const now = new Date();
    
    return {
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      saves: 0,
      reach: 0,
      impressions: 0,
      timestamp: now.toISOString(),
      engagementRate: (post.likes + post.comments + post.shares) / 100,
      saveRate: 0,
      shareRate: post.shares / 100,
      predictedEngagement,
      optimalPublishTime: this.calculateOptimalPublishTime(historicalData),
      contentScore: this.calculateContentScore(post, importance),
      audienceMatch: this.calculateAudienceMatch(post, historicalData)
    };
  }

  private extractFeatures(post: Post, historicalData: EngagementMetrics[]): PostFeatures {
    const postDate = new Date(post.timestamp);
    const previousEngagement = historicalData
      .slice(-5)
      .map(data => (data.likes + data.comments + data.shares) / 3);

    return {
      mediaType: post.mediaType || 'image',
      hashtagCount: (post.caption.match(/#/g) || []).length,
      captionLength: post.caption.length,
      postHour: postDate.getHours(),
      postDay: postDate.getDay(),
      previousEngagement
    };
  }

  private calculateWeightedEngagement(features: PostFeatures, importance: Map<string, number>): number {
    let score = 0;
    let totalWeight = 0;

    importance.forEach((weight, feature) => {
      const value = features[feature as keyof PostFeatures];
      if (typeof value === 'number') {
        score += value * weight;
        totalWeight += weight;
      }
    });

    return score / totalWeight;
  }

  private calculateOptimalPublishTime(historicalData: EngagementMetrics[]): Date {
    // Analyze historical engagement patterns to find optimal posting time
    const now = new Date();
    const hours = this.analyzeOptimalHours(historicalData);
    now.setHours(hours, 0, 0, 0);
    return now;
  }

  private analyzeOptimalHours(historicalData: EngagementMetrics[]): number {
    // In real implementation, this would analyze engagement patterns
    // For now, return a reasonable hour based on common peak times
    const peakHours = [9, 12, 15, 18, 21];
    return peakHours[Math.floor(Math.random() * peakHours.length)];
  }

  private calculateContentScore(post: Post, importance: Map<string, number>): number {
    // Calculate content quality score based on various factors
    const factors = {
      captionQuality: this.analyzeSentiment(post.caption),
      hashtagOptimization: this.analyzeHashtags(post.caption),
      mediaQuality: 0.8 // This would come from actual media analysis
    };

    return Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length;
  }

  private calculateAudienceMatch(post: Post, historicalData: EngagementMetrics[]): number {
    // Calculate how well the content matches audience preferences
    const averageEngagement = historicalData.reduce(
      (sum, data) => sum + (data.likes + data.comments + data.shares) / 3,
      0
    ) / historicalData.length;

    const currentEngagement = (post.likes + post.comments + post.shares) / 3;
    return Math.min(currentEngagement / averageEngagement, 1);
  }

  private analyzeHashtags(caption: string): number {
    const hashtags = caption.match(/#[a-zA-Z0-9]+/g) || [];
    // Optimal hashtag count is between 8-15
    const count = hashtags.length;
    return count >= 8 && count <= 15 ? 1 : count < 8 ? count / 8 : 15 / count;
  }

  private analyzeSentiment(text: string): number {
    // Enhanced sentiment analysis
    const positiveWords = ['great', 'amazing', 'awesome', 'love', 'excellent', 'best', 'perfect', 'fantastic'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'awful', 'worst', 'disappointing'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    return (positiveCount - negativeCount) / words.length || 0;
  }
}

@Injectable()
export class InstagramAudienceRecommendationService {
  private readonly logger = new Logger(InstagramAudienceRecommendationService.name);
  private readonly engagementPredictor = new EngagementPredictor();
  private mlPredictor: AdvancedMLPredictor;
  private mlEnabled = false;

  // Enhanced thresholds with ML-driven optimization
  private readonly RECOMMENDATION_THRESHOLDS = {
    criticalSuspiciousPercentage: 30,
    highSuspiciousPercentage: 20,
    criticalMassFollowersPercentage: 25,
    highMassFollowersPercentage: 15,
    lowEngagementRate: 1,
    criticalQualityScore: 40,
    lowQualityScore: 60,
    optimalPostTiming: {
      weekday: [
        { start: 11, end: 13 }, // Lunch time
        { start: 19, end: 21 }  // After work
      ],
      weekend: [
        { start: 10, end: 14 }, // Late morning
        { start: 17, end: 22 }  // Evening
      ]
    },
    contentTypes: {
      image: { minPerWeek: 3, maxPerWeek: 5 },
      video: { minPerWeek: 2, maxPerWeek: 4 },
      reels: { minPerWeek: 3, maxPerWeek: 5 },
      stories: { minPerWeek: 7, maxPerWeek: 21 }
    },
    mlOptimization: {
      minConfidenceScore: 0.7,
      minPredictedImprovement: 15,
      experimentalThreshold: 0.85
    },
    contentStrategy: {
      image: { 
        minPerWeek: 3, maxPerWeek: 5,
        optimalRatio: 0.4,
        minEngagementRate: 3
      },
      video: { 
        minPerWeek: 2, maxPerWeek: 4,
        optimalRatio: 0.3,
        minEngagementRate: 4
      },
      reels: { 
        minPerWeek: 3, maxPerWeek: 5,
        optimalRatio: 0.2,
        minEngagementRate: 5
      },
      stories: { 
        minPerWeek: 7, maxPerWeek: 21,
        optimalRatio: 0.1,
        minEngagementRate: 2
      }
    },
    hashtagStrategy: {
      popularThreshold: 1000000,
      nicheThreshold: 100000,
      microThreshold: 10000,
      optimal: {
        popular: 2,
        niche: 5,
        micro: 8
      }
    },
    monetization: {
      minFollowers: 10000,
      minEngagementRate: 3,
      minReachRate: 30,
      optimalPostRatio: 0.2
    },
    reelsStrategy: {
      minPerWeek: 5,
      optimalDuration: {
        min: 15,
        max: 30
      },
      peakHours: [
        { day: 'monday', hours: [9, 12, 17] },
        { day: 'tuesday', hours: [8, 13, 19] },
        // ... other days
      ],
      contentMix: {
        educational: 0.4,
        entertaining: 0.4,
        promotional: 0.2
      }
    },
    businessGrowth: {
      minEngagementForMonetization: 0.05,
      optimalPostingFrequency: {
        feed: 7,
        stories: 14,
        reels: 5,
        lives: 1
      },
      conversionOptimization: {
        ctrThreshold: 0.02,
        conversionRateThreshold: 0.03,
        roasTarget: 3
      }
    },
    collaborationMetrics: {
      minFollowers: 5000,
      minEngagementRate: 0.03,
      idealBrandFit: 0.7,
      audienceOverlap: 0.3
    }
  };

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly botDetectionService: InstagramBotDetectionService,
    private readonly growthPredictionService: InstagramGrowthPredictionService
  ) {
    // Skip ML initialization for now
    this.mlEnabled = false;
    this.logger.log('ML features are disabled until sufficient user data is available');
  }

  private async initializeML(): Promise<void> {
    // Skip ML initialization
    this.logger.log('Skipping ML initialization - waiting for sufficient user data');
  }

  async generateRecommendations(userId: string | number): Promise<AudienceRecommendation[]> {
    try {
      const [audienceQuality, optimizationMetrics] = await Promise.all([
        this.botDetectionService.analyzeAudienceQuality(Number(userId)),
        this.analyzeOptimizationMetrics(Number(userId))
      ]);

      const recommendations: AudienceRecommendation[] = [];

      // Check for suspicious accounts
      if (audienceQuality.suspiciousAccountsPercentage >= this.RECOMMENDATION_THRESHOLDS.criticalSuspiciousPercentage) {
        recommendations.push({
          type: 'security',
          priority: 'high',
          action: 'Conduct immediate audience cleanup',
          impact: 'Improve account authenticity and engagement',
          details: `${Math.round(audienceQuality.suspiciousAccountsPercentage)}% of your followers show suspicious behavior`,
          implementation: [
            'Remove suspicious followers',
            'Implement follower verification process',
            'Monitor follower growth patterns',
            'Enable additional security features',
            'Regular audience quality audits'
          ]
        });
      }

      // Check overall quality score
      if (audienceQuality.overallScore <= this.RECOMMENDATION_THRESHOLDS.criticalQualityScore) {
        recommendations.push({
          type: 'quality',
          priority: 'high',
          action: 'Implement comprehensive audience quality improvement plan',
          impact: 'Revitalize account health',
          details: 'Multiple metrics indicate need for significant audience quality improvements'
        });
      } else if (audienceQuality.overallScore <= this.RECOMMENDATION_THRESHOLDS.lowQualityScore) {
        recommendations.push({
          type: 'quality',
          priority: 'medium',
          action: 'Enhance audience quality metrics',
          impact: 'Strengthen account performance',
          details: 'Focus on gradual improvement of audience quality indicators'
        });
      }

      await this.addVisibilityRecommendations(recommendations, optimizationMetrics);
      await this.addContentStrategyRecommendations(recommendations, optimizationMetrics);
      await this.addTimingOptimizationRecommendations(recommendations, optimizationMetrics);
      await this.addHashtagRecommendations(recommendations, optimizationMetrics);
      await this.addMonetizationRecommendations(recommendations, Number(userId));
      await this.addMachineLearningInsights(recommendations, optimizationMetrics);

      return this.prioritizeRecommendations(recommendations);
    } catch (error) {
      this.logger.error(`Error generating recommendations for user ${userId}:`, error.stack);
      throw error;
    }
  }

  private async addMachineLearningInsights(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ) {
    // Skip ML insights when ML is disabled
    if (!this.mlEnabled) {
      this.logger.log('Skipping ML insights - ML features are disabled');
      return;
    }
    try {
      const historicalData = await this.getHistoricalEngagementData();
      const recentPosts = await this.getRecentPosts();
      
      const predictions = await Promise.all(
        recentPosts.map(post => this.mlPredictor.predict(1)) // Use a default user ID for now
      );
      
      const avgScore = predictions.reduce((sum, pred) => sum + pred.score, 0) / predictions.length;
      const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;
      
      recommendations.push({
        type: 'visibility',
        priority: 'high',
        action: 'Implement AI-driven content strategy',
        impact: 'Maximize engagement through deep learning insights',
        details: `Predicted engagement improvement: ${(avgScore * 100).toFixed(1)}%`,
        metrics: {
          current: avgScore * 100,
          target: avgScore * 150,
          improvement: 50,
          benchmarks: {
            industry: 75,
            similar_accounts: 70
          }
        },
        mlInsights: {
          confidence: avgConfidence,
          predictedImprovement: (avgScore - 1) * 100,
          keyFactors: ['Engagement rate', 'Content quality', 'Timing optimization'],
          experimentalFeatures: [
            'Neural network engagement prediction',
            'Deep learning content optimization',
            'Advanced sentiment analysis',
            'Automated A/B testing'
          ]
        },
        implementation: [
          'Implement ML-driven content optimization',
          'Use AI-powered posting time recommendations',
          'Optimize content based on predicted engagement',
          'Monitor and adapt to ML insights'
        ]
      });
    } catch (error) {
      this.logger.error('Error generating ML insights:', error.stack);
      throw error;
    }
  }

  private calculateVisibility: VisibilityAlgorithm = (post, userLocation, context) => {
    const baseScore = post.likes * 0.4 + post.comments * 0.3 + post.shares * 0.3;
    return baseScore;
  };

  private integrateKeyFactors(keyFactors: [string, number][], originalAlgorithm: VisibilityAlgorithm): VisibilityAlgorithm {
    return keyFactors.reduce((algorithm, [factor, importance]) => {
      return (post: Post, userLocation: UserLocation, context: VisibilityContext) => {
        const visibility = algorithm(post, userLocation, context);
        switch (factor) {
          case 'likes':
            return visibility + importance * Math.pow(post.likes, 1.2);
          case 'comments':
            return visibility + importance * this.analyzeSentiment(post.caption);
          case 'shares':
            return visibility + importance * this.calculateGeoAffinity(userLocation.location, context.tourism_zones);
          case 'sentiment':
            return visibility + importance * this.analyzeSentiment(post.caption);
          default:
            return visibility;
        }
      };
    }, originalAlgorithm);
  }

  private analyzeSentiment(text: string): number {
    // Enhanced sentiment analysis
    const positiveWords = ['great', 'amazing', 'awesome', 'love', 'excellent', 'best', 'perfect', 'fantastic'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'awful', 'worst', 'disappointing'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    return (positiveCount - negativeCount) / words.length || 0;
  }

  private calculateGeoAffinity(userLocation: string | undefined, tourismZones: string[]): number {
    if (!userLocation || !tourismZones.length) return 0;
    
    // Simple matching for now - could be enhanced with actual geo-distance calculation
    return tourismZones.includes(userLocation) ? 1 : 0;
  }

  private async addVisibilityRecommendations(recommendations: AudienceRecommendation[], metrics: OptimizationMetrics) {
    // Define key factors and their importance
    const keyFactors: [string, number][] = [
      ['likes', 0.4],
      ['comments', 0.3],
      ['shares', 0.2],
      ['sentiment', 0.1]
    ];

    // Integrate key factors into visibility algorithm
    const enhancedVisibilityAlgorithm = this.integrateKeyFactors(keyFactors, this.calculateVisibility);

    // Example context
    const context: VisibilityContext = {
      tourism_zones: ['Paris', 'London', 'New York'],
      trending_topics: ['travel', 'food', 'lifestyle'],
      peak_hours: [9, 12, 15, 18, 21],
      engagement_thresholds: {
        likes: 100,
        comments: 10,
        shares: 5
      }
    };

    // Calculate visibility score for recent posts
    const visibilityScore = await this.calculateAverageVisibility(enhancedVisibilityAlgorithm, context);

    recommendations.push({
      type: 'visibility',
      priority: 'high',
      action: 'Optimize content visibility',
      impact: 'Increase reach and engagement through algorithm optimization',
      details: `Current visibility score: ${visibilityScore.toFixed(2)}`,
      metrics: {
        current: visibilityScore,
        target: visibilityScore * 1.5,
        improvement: 50,
        benchmarks: {
          industry: 75,
          similar_accounts: 70
        }
      },
      mlInsights: {
        confidence: 0.85,
        predictedImprovement: 35,
        keyFactors: [
          'Engagement rate optimization',
          'Sentiment analysis improvement',
          'Geographic targeting enhancement',
          'Peak timing optimization'
        ]
      }
    });
  }

  private async calculateAverageVisibility(
    algorithm: VisibilityAlgorithm,
    context: VisibilityContext
  ): Promise<number> {
    const samplePosts: Post[] = [
      {
        likes: 150,
        comments: 15,
        shares: 8,
        caption: "Great day exploring the city! #travel #lifestyle",
        location: "Paris",
        timestamp: new Date()
      },
      {
        likes: 200,
        comments: 20,
        shares: 12,
        caption: "Amazing food at this new restaurant! Loving it!",
        location: "London",
        timestamp: new Date()
      }
    ];

    const scores = samplePosts.map(post => 
      algorithm(post, { location: post.location }, context)
    );

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private async addContentStrategyRecommendations(recommendations: AudienceRecommendation[], metrics: OptimizationMetrics) {
    recommendations.push({
      type: 'content',
      priority: 'high',
      action: 'Implement data-driven content strategy',
      impact: 'Maximize engagement through optimized content mix',
      details: 'Balance content types and posting frequency based on performance data',
      metrics: {
        current: 0, // To be filled with actual metrics
        target: 100,
        improvement: 0 // To be calculated
      },
      implementation: [
        'Maintain 40% educational, 30% entertaining, 30% promotional content mix',
        'Create content series for consistent engagement',
        'Use storytelling techniques in captions',
        'Implement A/B testing for content types',
        'Monitor and adapt to content performance metrics'
      ]
    });
  }

  private async addTimingOptimizationRecommendations(recommendations: AudienceRecommendation[], metrics: OptimizationMetrics) {
    recommendations.push({
      type: 'timing',
      priority: 'medium',
      action: 'Optimize posting schedule',
      impact: 'Maximize content reach through strategic timing',
      details: 'Post during peak engagement hours based on audience activity patterns',
      implementation: [
        'Schedule posts during identified peak hours',
        'Maintain consistent posting frequency',
        'Adapt timing to audience timezone distribution',
        'Consider day-of-week engagement patterns',
        'Monitor and adjust based on performance data'
      ]
    });
  }

  private async addReelsOptimizationRecommendations(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ) {
    recommendations.push({
      type: 'reels',
      priority: 'high',
      action: 'Optimize Reels strategy for maximum reach',
      impact: 'Increase visibility and engagement through short-form video',
      details: 'Implement advanced Reels optimization techniques based on platform algorithms',
      implementation: [
        'Create 15-30 second Reels focusing on trending topics',
        'Use trending audio and music',
        'Implement pattern interrupts in first 3 seconds',
        'Create content loops for higher retention',
        'Use text overlays for silent viewers'
      ],
      mlInsights: {
        confidence: 0.9,
        predictedImprovement: 40,
        keyFactors: [
          'Audio trend alignment',
          'Viewing duration optimization',
          'Peak posting times',
          'Content hook effectiveness'
        ]
      }
    });
  }

  private async addBusinessGrowthRecommendations(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ) {
    recommendations.push({
      type: 'business',
      priority: 'high',
      action: 'Implement business growth strategy',
      impact: 'Maximize revenue and business opportunities',
      details: 'Optimize profile for business conversions and partnerships',
      businessMetrics: {
        conversionRate: 0.03,
        clickThroughRate: 0.05,
        averageOrderValue: 75,
        customerLifetimeValue: 250,
        returnOnAdSpend: 2.8
      },
      implementation: [
        'Optimize bio for business inquiries',
        'Create highlight reels showcasing services/products',
        'Implement clear call-to-actions in content',
        'Develop lead magnet strategy',
        'Create content showcasing client success stories'
      ]
    });
  }

  private async addCollaborationRecommendations(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ) {
    recommendations.push({
      type: 'collaboration',
      priority: 'medium',
      action: 'Optimize collaboration strategy',
      impact: 'Increase brand partnerships and sponsorship opportunities',
      details: 'Develop strategic approach to brand collaborations',
      implementation: [
        'Create compelling brand pitch deck',
        'Develop case studies from previous collaborations',
        'Implement professional media kit',
        'Network with brand representatives',
        'Join influencer marketing platforms'
      ],
      metrics: {
        current: 0,
        target: 100,
        roi: {
          potential: 5000,
          timeframe: '3 months',
          confidence: 0.85
        }
      }
    });
  }

  private async addConversionOptimizationRecommendations(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ) {
    recommendations.push({
      type: 'conversion',
      priority: 'high',
      action: 'Optimize for conversions',
      impact: 'Increase conversion rates and ROI',
      details: 'Implement conversion optimization strategies',
      implementation: [
        'Create strategic content funnels',
        'Optimize link-in-bio landing pages',
        'Implement story swipe-up optimization',
        'Develop lead capture system',
        'Create retargeting strategy'
      ],
      businessMetrics: {
        conversionRate: 0.025,
        clickThroughRate: 0.04,
        returnOnAdSpend: 2.5
      }
    });
  }

  private async addAudienceSegmentationRecommendations(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ) {
    recommendations.push({
      type: 'business',
      priority: 'high',
      action: 'Implement audience segmentation strategy',
      impact: 'Increase engagement and conversion rates through targeted content',
      details: 'Develop targeted content strategies for different audience segments',
      mlInsights: {
        confidence: 0.88,
        predictedImprovement: 35,
        keyFactors: [
          'Audience segmentation analysis',
          'Engagement pattern recognition',
          'Conversion funnel optimization',
          'Content personalization'
        ],
        audienceSegments: [
          {
            segment: 'High-value prospects',
            size: 0.2,
            engagementRate: 0.08,
            conversionPotential: 0.15
          },
          {
            segment: 'Brand advocates',
            size: 0.3,
            engagementRate: 0.12,
            conversionPotential: 0.1
          },
          {
            segment: 'Content engagers',
            size: 0.5,
            engagementRate: 0.05,
            conversionPotential: 0.03
          }
        ]
      },
      implementation: [
        'Create segment-specific content strategies',
        'Develop targeted messaging frameworks',
        'Implement engagement funnels per segment',
        'Track segment-specific metrics',
        'Optimize content based on segment performance'
      ]
    });
  }

  async saveRecommendations(
    userId: string | number,
    recommendations: AudienceRecommendation[]
  ): Promise<Recommendation[]> {
    try {
      const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
      if (!user) {
        throw new Error('User not found');
      }

      const savedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          const recommendation = new Recommendation();
          recommendation.user = user;
          recommendation.recommendationType = rec.type;
          recommendation.recommendation = JSON.stringify({
            priority: rec.priority,
            action: rec.action,
            impact: rec.impact,
            details: rec.details,
            metrics: rec.metrics,
            implementation: rec.implementation
          });

          return this.recommendationRepository.save(recommendation);
        })
      );

      return savedRecommendations;
    } catch (error) {
      this.logger.error(`Error saving recommendations for user ${userId}:`, error.stack);
      throw error;
    }
  }

  async getRecommendationsByPriority(
    userId: string | number,
    priority?: 'high' | 'medium' | 'low'
  ): Promise<Recommendation[]> {
    try {
      const query = this.recommendationRepository
        .createQueryBuilder('recommendation')
        .where('recommendation.user.id = :userId', { userId: Number(userId) })
        .orderBy('recommendation.createdAt', 'DESC');

      if (priority) {
        query.andWhere('JSON_EXTRACT(recommendation.recommendation, "$.priority") = :priority', { priority });
      }

      return query.getMany();
    } catch (error) {
      this.logger.error(`Error fetching recommendations for user ${userId}:`, error.stack);
      throw error;
    }
  }

  private async analyzeOptimizationMetrics(userId: number): Promise<OptimizationMetrics> {
    // Implementation would include actual API calls and data analysis
    return {
      contentPerformance: [],
      timingPerformance: [],
      hashtagPerformance: []
    };
  }

  private async getHistoricalEngagementData(): Promise<EngagementMetrics[]> {
    // This would be implemented to fetch real historical data
    const now = new Date();
    return [
      { 
        likes: 150, 
        comments: 15, 
        shares: 8, 
        saves: 20, 
        reach: 1000, 
        impressions: 1200,
        timestamp: new Date(now.getTime() - 86400000).toISOString() // 1 day ago
      },
      { 
        likes: 200, 
        comments: 20, 
        shares: 12, 
        saves: 25, 
        reach: 1200, 
        impressions: 1500,
        timestamp: new Date(now.getTime() - 172800000).toISOString() // 2 days ago
      }
    ];
  }

  private async getRecentPosts(): Promise<Post[]> {
    // This would be implemented to fetch real recent posts
    return [
      {
        likes: 150,
        comments: 15,
        shares: 8,
        caption: "Great day exploring the city! #travel #lifestyle",
        location: "Paris",
        timestamp: new Date()
      },
      {
        likes: 200,
        comments: 20,
        shares: 12,
        caption: "Amazing food at this new restaurant! Loving it!",
        location: "London",
        timestamp: new Date()
      }
    ];
  }

  private async addHashtagRecommendations(
    recommendations: AudienceRecommendation[],
    metrics: OptimizationMetrics
  ): Promise<void> {
    recommendations.push({
      type: 'hashtags',
      priority: 'high',
      action: 'Optimize hashtag strategy',
      impact: 'Increase content discoverability and reach',
      details: 'Implement data-driven hashtag optimization',
      metrics: {
        current: 0,
        target: 100,
        benchmarks: {
          industry: 80,
          similar_accounts: 75
        }
      },
      implementation: [
        'Use a mix of popular, niche, and micro hashtags',
        'Track hashtag performance metrics',
        'Rotate hashtags strategically',
        'Create branded hashtags',
        'Monitor trending hashtags in your niche'
      ]
    });
  }

  private async addMonetizationRecommendations(
    recommendations: AudienceRecommendation[],
    userId: number
  ): Promise<void> {
    recommendations.push({
      type: 'monetization',
      priority: 'medium',
      action: 'Optimize monetization strategy',
      impact: 'Maximize revenue potential',
      details: 'Implement strategic monetization opportunities',
      implementation: [
        'Develop branded content guidelines',
        'Create a media kit',
        'Set up affiliate partnerships',
        'Explore Instagram Shopping features',
        'Build sponsored content frameworks'
      ]
    });
  }

  private prioritizeRecommendations(recommendations: AudienceRecommendation[]): AudienceRecommendation[] {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const typeWeight = {
      security: 5,
      quality: 4,
      engagement: 4,
      growth: 4,
      visibility: 3,
      content: 3,
      timing: 2,
      hashtags: 2,
      monetization: 1,
      business: 4,
      reels: 3,
      stories: 3,
      conversion: 4,
      collaboration: 3
    };

    return recommendations.sort((a, b) => {
      const aScore = priorityWeight[a.priority] * (typeWeight[a.type] || 1);
      const bScore = priorityWeight[b.priority] * (typeWeight[b.type] || 1);
      return bScore - aScore;
    });
  }
} 