import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { PostHashtag } from '../post_hashtags/post_hashtag.entity';
import { Location } from '../locations/location.entity';
import { ContentType } from '../instagram/types/content.types';

@Entity('posts')
@Index('idx_posts_user_date', ['user', 'createdAt'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'external_id', unique: true })
  externalId: string;

  @Column({ type: 'varchar', nullable: true })
  caption: string;

  @Column({ name: 'media_type' })
  mediaType: string;

  @Column({ name: 'media_url' })
  mediaUrl: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column()
  permalink: string;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  insights: any;

  @Column({ type: 'varchar', nullable: true })
  instagramId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'enum', enum: ContentType })
  type: ContentType;

  @Column({ type: 'integer', default: 0 })
  likes: number;

  @Column({ type: 'integer', default: 0 })
  comments: number;

  @Column({ type: 'integer', default: 0 })
  saves: number;

  @Column({ type: 'integer', default: 0 })
  shares: number;

  @Column({ type: 'integer', default: 0 })
  reach: number;

  @Column({ type: 'float', default: 0 })
  engagementRate: number;

  @Column({ type: 'float', default: 0 })
  reachRate: number;

  @Column({ type: 'integer', default: 0 })
  captionLength: number;

  @Column({ type: 'integer', default: 0 })
  hashtagCount: number;

  @Column({ type: 'integer', default: 0 })
  emojiCount: number;

  @Column({ type: 'integer', default: 0 })
  mentionCount: number;

  @Column({ type: 'boolean', default: false })
  hasCallToAction: boolean;

  @Column({ type: 'boolean', default: false })
  isTopPerforming: boolean;

  @Column({ type: 'enum', enum: ['positive', 'neutral', 'negative'], nullable: true })
  sentiment: 'positive' | 'neutral' | 'negative';

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Location, { nullable: true })
  location: Location;

  @OneToMany(() => PostHashtag, postHashtag => postHashtag.post)
  postHashtags: PostHashtag[];

  @Column({ type: 'jsonb', nullable: true })
  hashtags: string[];
}