import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('social_networks')
export class SocialNetwork {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.socialNetworks)
  user: User;

  @Column()
  platform: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column('jsonb', { nullable: true })
  metrics: {
    followers: number;
    engagement: number;
    reach: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
