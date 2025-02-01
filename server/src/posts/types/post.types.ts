export interface PerformanceMetrics {
  count: number;
  totalEngagement: number;
  averageEngagement: number;
}

export interface PostAnalytics {
  id: number;
  engagementRate: number;
  reachRate: number;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
  };
  contentAnalysis: {
    captionLength: number;
    hashtagCount: number;
    emojiCount: number;
    mentionCount: number;
    hasCallToAction: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  performance: {
    isTopPerforming: boolean;
  };
}

export interface PostInsights {
  totalPosts: number;
  averageEngagement: number;
  topPerformingCount: number;
  performanceByType: Record<string, PerformanceMetrics>;
  trends: {
    engagement: Array<{ date: Date; value: number }>;
    reach: Array<{ date: Date; value: number }>;
  };
} 