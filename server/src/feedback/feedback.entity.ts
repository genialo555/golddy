import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';
import { User } from '../user/user.entity';
import { Collaboration } from '../collaborations/collaboration.entity';

@Entity()
@Check('rating_check', 'rating >= 1 AND rating <= 5')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @ManyToOne(() => User, (user: User) => user.feedback)
  user: User;

  @ManyToOne(() => Collaboration, (collaboration: Collaboration) => collaboration.feedback)
  collaboration: Collaboration;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
