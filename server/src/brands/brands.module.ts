import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './brand.entity';
import { CollaborationsModule } from '../collaborations/collaborations.module';
import { UserModule } from '../user/user.module';
import { AffinityScoresModule } from '../affinity_scores/affinity_scores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    forwardRef(() => CollaborationsModule),
    forwardRef(() => UserModule),
    forwardRef(() => AffinityScoresModule),
  ],
  exports: [TypeOrmModule],
})
export class BrandsModule {} 