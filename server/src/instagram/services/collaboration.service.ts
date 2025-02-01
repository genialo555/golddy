import { Injectable } from '@nestjs/common';
import { InstagramBaseService } from './base.service';
import { Collaboration } from '../../collaborations/collaboration.entity';
import { Brand } from '../../brands/brand.entity';
import { Feedback } from '../../feedback/feedback.entity';
import { CollaborationStatus } from '../types/collaboration.types';

interface Post {
  id: string;
  mediaType: string;
  mediaUrl: string;
  likeCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  reach: number;
  impressions: number;
}

interface CollaborationMetrics {
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

interface CollaborationInsights {
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

@Injectable()
export class InstagramCollaborationService extends InstagramBaseService {
  async getCollaborationInsights(
    username: string,
    startDate: Date,
    endDate: Date
  ): Promise<CollaborationInsights> {
    try {
      // Get posts within the date range
      const posts = await this.makeRequest('/user/media', 'scraper', {
        username,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      // Get audience metrics before and after
      const beforeAudience = await this.makeRequest('/user/info', 'scraper', {
        username,
        date: startDate.toISOString()
      });

      const afterAudience = await this.makeRequest('/user/info', 'scraper', {
        username,
        date: endDate.toISOString()
      });

      // Calculate metrics
      const metrics = this.calculateCollaborationMetrics(posts);
      const audienceGrowth = this.calculateAudienceGrowth(beforeAudience, afterAudience);

      return {
        metrics,
        posts: posts.map((post: Post) => ({
          id: post.id,
          type: post.mediaType,
          url: post.mediaUrl,
          performance: {
            likes: post.likeCount || 0,
            comments: post.commentsCount || 0,
            saves: post.savesCount || 0,
            shares: post.sharesCount || 0
          }
        })),
        audienceGrowth
      };
    } catch (error) {
      this.logger.error(`Error getting collaboration insights: ${error.message}`, error.stack);
      throw error;
    }
  }

  private calculateCollaborationMetrics(posts: Post[]): CollaborationMetrics {
    const totalEngagements = posts.reduce((acc, post) => ({
      likes: acc.likes + (post.likeCount || 0),
      comments: acc.comments + (post.commentsCount || 0),
      saves: acc.saves + (post.savesCount || 0),
      shares: acc.shares + (post.sharesCount || 0)
    }), { likes: 0, comments: 0, saves: 0, shares: 0 });

    const totalReach = posts.reduce((acc, post) => acc + (post.reach || 0), 0);
    const totalImpressions = posts.reduce((acc, post) => acc + (post.impressions || 0), 0);

    const totalEngagement = totalEngagements.likes + totalEngagements.comments + 
                          totalEngagements.saves + totalEngagements.shares;
    const engagementRate = (totalEngagement / (totalReach * posts.length)) * 100;

    return {
      reach: totalReach,
      impressions: totalImpressions,
      engagement: {
        ...totalEngagements,
        rate: engagementRate
      },
      roi: 0, // This would be calculated based on campaign cost and conversions
      conversionRate: 0 // This would need conversion tracking data
    };
  }

  private calculateAudienceGrowth(before: any, after: any) {
    const beforeCount = before.followersCount || 0;
    const afterCount = after.followersCount || 0;
    const gain = afterCount - beforeCount;
    const gainPercentage = (gain / beforeCount) * 100;

    return {
      before: beforeCount,
      after: afterCount,
      gain,
      gainPercentage
    };
  }

  async createCollaboration(
    userId: number,
    brandId: number,
    data: {
      name: string;
      startDate: Date;
      endDate: Date;
      budget: number;
      goals: string[];
      requirements: string[];
    }
  ): Promise<Collaboration> {
    const collaboration = new Collaboration();
    collaboration.name = data.name;
    collaboration.startDate = data.startDate;
    collaboration.endDate = data.endDate;
    collaboration.budget = data.budget;
    collaboration.goals = data.goals;
    collaboration.requirements = data.requirements;
    collaboration.status = 'planifiée';

    return collaboration;
  }

  async updateCollaborationStatus(
    collaborationId: number,
    status: CollaborationStatus,
    feedback?: {
      rating: number;
      comment: string;
    }
  ): Promise<{ collaboration: Collaboration; feedback?: Feedback }> {
    const collaboration = new Collaboration();
    collaboration.status = status;

    let collaborationFeedback: Feedback | undefined;
    if (feedback) {
      collaborationFeedback = new Feedback();
      collaborationFeedback.rating = feedback.rating;
      collaborationFeedback.comment = feedback.comment;
    }

    return {
      collaboration,
      feedback: collaborationFeedback
    };
  }
} 