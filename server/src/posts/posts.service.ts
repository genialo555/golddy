import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '@/posts/post.entity';
import { PostAnalytics, PostInsights, PerformanceMetrics } from '@/posts/types/post.types';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async findByUserId(userId: number, options: { page: number; limit: number }) {
    const [data, total] = await this.postRepository.findAndCount({
      where: { userId },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: { createdAt: 'DESC' }
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'location', 'postHashtags']
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async getAnalytics(id: number): Promise<PostAnalytics> {
    const post = await this.findOne(id);
    
    return {
      id: post.id,
      engagementRate: post.engagementRate,
      reachRate: post.reachRate,
      metrics: {
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
        reach: post.reach
      },
      contentAnalysis: {
        captionLength: post.captionLength,
        hashtagCount: post.hashtagCount,
        emojiCount: post.emojiCount,
        mentionCount: post.mentionCount,
        hasCallToAction: post.hasCallToAction,
        sentiment: post.sentiment
      },
      performance: {
        isTopPerforming: post.isTopPerforming
      }
    };
  }

  async getInsights(userId: number): Promise<PostInsights> {
    const posts = await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    const totalPosts = posts.length;
    if (totalPosts === 0) {
      return {
        totalPosts: 0,
        averageEngagement: 0,
        topPerformingCount: 0,
        performanceByType: {},
        trends: {
          engagement: [],
          reach: []
        }
      };
    }

    const performanceByType = posts.reduce((acc, post) => {
      acc[post.type] = acc[post.type] || { count: 0, totalEngagement: 0, averageEngagement: 0 };
      acc[post.type].count++;
      acc[post.type].totalEngagement += post.engagementRate;
      return acc;
    }, {} as Record<string, PerformanceMetrics>);

    Object.keys(performanceByType).forEach(type => {
      performanceByType[type].averageEngagement = 
        performanceByType[type].totalEngagement / performanceByType[type].count;
    });

    return {
      totalPosts,
      averageEngagement: posts.reduce((sum, post) => sum + post.engagementRate, 0) / totalPosts,
      topPerformingCount: posts.filter(post => post.isTopPerforming).length,
      performanceByType,
      trends: {
        engagement: posts.map(post => ({
          date: post.createdAt,
          value: post.engagementRate
        })),
        reach: posts.map(post => ({
          date: post.createdAt,
          value: post.reachRate
        }))
      }
    };
  }
} 