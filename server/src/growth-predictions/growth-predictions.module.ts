import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrowthPrediction } from './growth-prediction.entity';
import { GrowthPredictionsService } from './growth-predictions.service';
import { UserModule } from '../user/user.module';
import { FollowersHistoryModule } from '../followers_history/followers_history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GrowthPrediction]),
    forwardRef(() => UserModule),
    FollowersHistoryModule,
  ],
  providers: [GrowthPredictionsService],
  exports: [TypeOrmModule, GrowthPredictionsService],
})
export class GrowthPredictionsModule {} 