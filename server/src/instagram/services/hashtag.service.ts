import { Injectable } from '@nestjs/common';
import { InstagramBaseService } from './base.service';
import { PostHashtag } from '../../post_hashtags/post_hashtag.entity';
import { Hashtag } from '../../hashtags/hashtag.entity';
import { HashtagPerformance } from '../types/hashtag.types';

@Injectable()
export class InstagramHashtagService extends InstagramBaseService {
  async analyzeHashtags(username: string): Promise<HashtagPerformance[]> {
    try {
      // Get user's media posts
      const posts = await this.makeRequest('/user/media', 'scraper', { username });
      
      // Extract and analyze hashtags
      const hashtagStats = this.extractHashtagStats(posts);
      
      // Calculate performance metrics
      return this.calculateHashtagPerformance(hashtagStats, posts.length);
    } catch (error) {
      this.logger.error(`Error analyzing hashtags for user ${username}:`, error.stack);
      throw error;
    }
  }

  private extractHashtagStats(posts: any[]): Map<string, { 
    appearances: number,
    likes: number,
    comments: number,
    reach: number
  }> {
    const hashtagStats = new Map();

    posts.forEach(post => {
      const hashtags = this.extractHashtagsFromCaption(post.caption);
      const engagement = {
        likes: post.likeCount || 0,
        comments: post.commentsCount || 0,
        reach: post.reach || 0
      };

      hashtags.forEach(tag => {
        const stats = hashtagStats.get(tag) || { 
          appearances: 0, 
          likes: 0, 
          comments: 0,
          reach: 0
        };

        hashtagStats.set(tag, {
          appearances: stats.appearances + 1,
          likes: stats.likes + engagement.likes,
          comments: stats.comments + engagement.comments,
          reach: stats.reach + engagement.reach
        });
      });
    });

    return hashtagStats;
  }

  private calculateHashtagPerformance(
    hashtagStats: Map<string, any>, 
    totalPosts: number
  ): HashtagPerformance[] {
    const performance: HashtagPerformance[] = [];

    hashtagStats.forEach((stats, tag) => {
      const frequency = (stats.appearances / totalPosts) * 100;
      const engagementRate = ((stats.likes + stats.comments) / stats.appearances) / 100;
      const reachRate = (stats.reach / stats.appearances) / 100;

      performance.push({
        tag,
        frequency,
        engagementRate,
        totalLikes: stats.likes,
        totalComments: stats.comments,
        reachRate
      });
    });

    // Sort by engagement rate descending
    return performance.sort((a, b) => b.engagementRate - a.engagementRate);
  }

  private extractHashtagsFromCaption(caption: string): string[] {
    if (!caption) return [];
    const hashtagRegex = /#(\w+)/g;
    const matches = caption.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  async createOrUpdateHashtags(
    userId: number, 
    hashtagPerformance: HashtagPerformance[]
  ): Promise<Hashtag[]> {
    const hashtags: Hashtag[] = hashtagPerformance.map(perf => {
      const hashtag = new Hashtag();
      hashtag.tag = perf.tag;
      hashtag.frequency = perf.frequency;
      hashtag.performanceScore = perf.engagementRate;
      hashtag.engagementAverage = (perf.totalLikes + perf.totalComments) / perf.frequency;
      hashtag.postCount = Math.round(perf.frequency);
      return hashtag;
    });

    return hashtags;
  }

  async linkHashtagsToPosts(
    postId: number,
    hashtags: string[]
  ): Promise<PostHashtag[]> {
    const postHashtags: PostHashtag[] = hashtags.map(tag => {
      const postHashtag = new PostHashtag();
      // Relationships will be set by the repository
      return postHashtag;
    });

    return postHashtags;
  }
} 