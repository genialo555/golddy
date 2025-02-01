import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Integration } from '../integrations/integration.entity';

@Entity('marketplaces')
export class Marketplace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'api_endpoint', length: 255, nullable: true })
  apiEndpoint: string;

  @OneToMany(() => Integration, (integration: Integration) => integration.marketplace, {
    cascade: true
  })
  integrations: Integration[];
}
