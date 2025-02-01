export interface EngagementMetrics {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
}

export interface AudienceMetrics {
  totalFollowers: number;
  averageLikes: number;
  averageComments: number;
  averageSaves: number;
  averageShares: number;
  averageReach: number;
  totalPosts: number;
  followerGrowth: number;
}

export interface BenchmarkMetrics {
  industry: {
    engagementRate: number;
    reachRate: number;
    saveRate: number;
    shareRate: number;
  };
  similar: {
    engagementRate: number;
    reachRate: number;
    saveRate: number;
    shareRate: number;
  };
}

export interface AudienceQualityScore {
  overallScore: number;
  engagementRate: number;
  commentQuality: number;
  reachEfficiency: number;
  saveRate: number;
  shareRate: number;
  benchmarks: BenchmarkMetrics;
  metrics: AudienceMetrics;
} 