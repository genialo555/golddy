import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PostHashtag } from '../post_hashtags/post_hashtag.entity';
import { User } from '../user/user.entity';

@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tag: string;

  @Column({ type: 'float', default: 0 })
  frequency: number;

  @Column({ type: 'float', default: 0 })
  performanceScore: number;

  @Column({ type: 'float', default: 0 })
  engagementAverage: number;

  @Column({ type: 'integer', default: 0 })
  postCount: number;

  @OneToMany(() => PostHashtag, postHashtag => postHashtag.tag)
  postHashtags: PostHashtag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User)
  user: User;
}
