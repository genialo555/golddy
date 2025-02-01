import { EntityRepository, Repository } from 'typeorm';
import { PostHashtag } from './post_hashtag.entity';

@EntityRepository(PostHashtag)
export class PostHashtagRepository extends Repository<PostHashtag> {
  // Add custom repository methods here if needed
}
