import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, Unique } from 'typeorm';
import { User } from '../user/user.entity';
import { Marketplace } from '../marketplaces/marketplace.entity';

@Entity('integrations')
@Index('idx_integrations_user_marketplace', ['user', 'marketplace'])
@Unique('unique_user_marketplace', ['user', 'marketplace'])
export class Integration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.integrations, {
    onDelete: 'CASCADE'
  })
  user: User;

  @ManyToOne(() => Marketplace, marketplace => marketplace.integrations, {
    onDelete: 'CASCADE'
  })
  marketplace: Marketplace;

  @Column({ name: 'oauth_token', length: 255, nullable: true })
  oauthToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
