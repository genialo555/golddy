import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffinityScore } from './affinity_score.entity';
import { BrandsModule } from '../brands/brands.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AffinityScore]),
    forwardRef(() => BrandsModule),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule],
})
export class AffinityScoresModule {}
