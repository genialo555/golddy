export interface CollaborationMetrics {
  reach: number;
  impressions: number;
  engagement: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    rate: number;
  };
  roi: number;
  conversionRate: number;
}

export interface CollaborationInsights {
  metrics: CollaborationMetrics;
  posts: {
    id: string;
    type: string;
    url: string;
    performance: {
      likes: number;
      comments: number;
      saves: number;
      shares: number;
    };
  }[];
  audienceGrowth: {
    before: number;
    after: number;
    gain: number;
    gainPercentage: number;
  };
}

export type CollaborationStatus = 'en cours' | 'terminée' | 'planifiée'; 