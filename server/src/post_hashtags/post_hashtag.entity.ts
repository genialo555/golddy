import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('post_hashtags')
export class PostHashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, post => post.postHashtags)
  post: Post;

  @Column({ type: 'varchar' })
  tag: string;

  @CreateDateColumn()
  createdAt: Date;
}
