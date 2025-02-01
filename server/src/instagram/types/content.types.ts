export enum ContentType {
  IMAGE = 'image',
  CAROUSEL = 'carousel',
  VIDEO = 'video',
  REEL = 'reel',
  IGTV = 'igtv'
}

export interface CaptionAnalysis {
  length: number;
  hasEmojis: boolean;
  emojiCount: number;
  hashtagCount: number;
  mentionCount: number;
  callToAction: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  readabilityScore: number;
}

export interface TimePerformance {
  hour: number;
  day: string;
  engagementRate: number;
  reachRate: number;
  totalPosts: number;
}

export interface ContentTypePerformance {
  type: ContentType;
  engagementRate: number;
  reachRate: number;
  averageLikes: number;
  averageComments: number;
  averageSaves: number;
  averageShares: number;
  totalPosts: number;
  captionStats: {
    averageLength: number;
    emojiUsage: number;
    hashtagUsage: number;
    mentionUsage: number;
    callToActionUsage: number;
  };
}

export interface HashtagPerformance {
  tag: string;
  frequency: number;
  engagementRate: number;
  reachRate: number;
  totalPosts: number;
  performance: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
  };
}

export interface ContentPerformanceAnalysis {
  bestPerformingTypes: ContentTypePerformance[];
  bestPostingTimes: TimePerformance[];
  topHashtags: HashtagPerformance[];
  overallStats: {
    totalPosts: number;
    averageEngagement: number;
    averageReach: number;
    topPerformingPost: {
      id: string;
      type: ContentType;
      engagementRate: number;
      likes: number;
      comments: number;
      saves: number;
      shares: number;
      caption?: CaptionAnalysis;
    };
    contentQuality: {
      captionLength: {
        short: number;
        medium: number;
        long: number;
      };
      emojiUsage: number;
      hashtagUsage: {
        average: number;
        optimal: number;
      };
      callToActionUsage: number;
    };
  };
  trends: {
    engagement: {
      trend: 'up' | 'down' | 'stable';
      percentage: number;
    };
    reach: {
      trend: 'up' | 'down' | 'stable';
      percentage: number;
    };
    contentType: {
      mostImproved: ContentType;
      improvement: number;
    };
  };
} 