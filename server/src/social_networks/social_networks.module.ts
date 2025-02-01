import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialNetwork } from './social_network.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialNetwork])],
  exports: [TypeOrmModule]
})
export class SocialNetworkModule {}
