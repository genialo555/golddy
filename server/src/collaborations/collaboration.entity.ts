import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Brand } from '../brands/brand.entity';
import { Feedback } from '../feedback/feedback.entity';
import { Type } from 'class-transformer';

export type CollaborationStatus = 'en cours' | 'terminée' | 'planifiée';

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  @Type(() => Date)
  startDate: Date;

  @Column({ type: 'timestamp' })
  @Type(() => Date)
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budget: number;

  @Column('simple-array')
  goals: string[];

  @Column('simple-array')
  requirements: string[];

  @Column({
    type: 'enum',
    enum: ['en cours', 'terminée', 'planifiée'],
    default: 'planifiée'
  })
  status: CollaborationStatus;

  @ManyToOne(() => User, user => user.collaborations, {
    onDelete: 'CASCADE'
  })
  influencer: User;

  @ManyToOne(() => Brand, brand => brand.collaborations, {
    onDelete: 'CASCADE'
  })
  brand: Brand;

  @OneToMany(() => Feedback, feedback => feedback.collaboration, {
    cascade: true
  })
  feedback: Feedback[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
