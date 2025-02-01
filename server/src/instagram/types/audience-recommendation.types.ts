export interface AudienceRecommendation {
  type: 'engagement' | 'growth' | 'quality' | 'security' | 'visibility' | 'content' | 
        'timing' | 'hashtags' | 'monetization' | 'business' | 'reels' | 'stories' | 
        'conversion' | 'collaboration';
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

export interface RecommendationResponse {
  username: string;
  timestamp: Date;
  recommendations: AudienceRecommendation[];
  summary: {
    totalRecommendations: number;
    priorityBreakdown: {
      high: number;
      medium: number;
      low: number;
    };
    typeBreakdown: {
      [key: string]: number;
    };
  };
} 