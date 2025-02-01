import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.recommendations, {
    onDelete: 'CASCADE'
  })
  user: User;

  @Column({ name: 'recommendation_type', length: 50, nullable: true })
  recommendationType: string;

  @Column({ type: 'text' })
  recommendation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
