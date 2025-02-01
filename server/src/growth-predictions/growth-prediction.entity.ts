import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

interface PredictionFactors {
  thirtyDayGrowth: number;
  ninetyDayGrowth: number;
  dataPoints: number;
  currentFollowers: number;
}

@Entity('growth_predictions')
export class GrowthPrediction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.growthPredictions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'predicted_followers' })
  predictedFollowers: number;

  @Column({ type: 'float', name: 'growth_rate' })
  growthRate: number;

  @Column({ type: 'float', name: 'confidence_score' })
  confidenceScore: number;

  @Column({ type: 'jsonb' })
  factors: PredictionFactors;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
