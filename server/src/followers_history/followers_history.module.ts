import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowersHistory } from './followers_history.entity';
import { FollowersHistoryService } from './followers_history.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowersHistory]),
    forwardRef(() => UserModule),
  ],
  providers: [FollowersHistoryService],
  exports: [TypeOrmModule, FollowersHistoryService],
})
export class FollowersHistoryModule {} 