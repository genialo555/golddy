import { Controller, Get, Post, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { PostsService } from '@/posts/posts.service';
import { Post as PostEntity } from '@/posts/post.entity';
import { PostAnalytics, PostInsights } from '@/posts/types/post.types';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ data: PostEntity[]; total: number }> {
    return this.postsService.findByUserId(parseInt(userId, 10), { page, limit });
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ data: PostEntity[]; total: number }> {
    return this.postsService.findByUserId(parseInt(userId, 10), { page, limit });
  }

  @Get('analytics/:id')
  async getPostAnalytics(@Param('id') id: string): Promise<PostAnalytics> {
    const analytics = await this.postsService.getAnalytics(parseInt(id, 10));
    if (!analytics) {
      throw new NotFoundException(`Analytics for post ID ${id} not found`);
    }
    return analytics;
  }

  @Get('insights/:userId')
  async getPostInsights(@Param('userId') userId: string): Promise<PostInsights> {
    return this.postsService.getInsights(parseInt(userId, 10));
  }

  @Get(':id')
  async getPost(@Param('id') id: string): Promise<PostEntity> {
    const post = await this.postsService.findOne(parseInt(id, 10));
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
} 