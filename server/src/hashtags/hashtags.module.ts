import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag])],
  exports: [TypeOrmModule],
})
export class HashtagsModule {} 