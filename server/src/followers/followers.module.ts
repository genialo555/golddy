import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowersHistory } from '../followers_history/followers_history.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowersHistory]),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule],
})
export class FollowersModule {}
