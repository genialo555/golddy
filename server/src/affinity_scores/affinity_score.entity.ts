import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Brand } from '../brands/brand.entity';

@Entity('affinity_scores')
export class AffinityScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, user => user.affinityScores, {
    onDelete: 'CASCADE'
  })
  user: User;

  @ManyToOne(() => Brand, brand => brand.affinityScores, {
    onDelete: 'CASCADE'
  })
  brand: Brand;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}