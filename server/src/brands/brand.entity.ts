import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Collaboration } from '../collaborations/collaboration.entity';
import { AffinityScore } from '../affinity_scores/affinity_score.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  website: string;

  @Column({ nullable: true })
  category: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column('simple-array', { nullable: true })
  industries: string[];

  @Column('simple-array', { nullable: true })
  targetAudience: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageBudget: number;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => Collaboration, (collaboration: Collaboration) => collaboration.brand, {
    cascade: true
  })
  collaborations: Collaboration[];

  @OneToMany(() => AffinityScore, (affinityScore: AffinityScore) => affinityScore.brand, {
    cascade: true
  })
  affinityScores: AffinityScore[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
