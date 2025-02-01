import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostHashtag } from './post_hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostHashtag])],
  exports: [TypeOrmModule],
})
export class PostHashtagsModule {} 