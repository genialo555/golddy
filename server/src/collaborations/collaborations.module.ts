import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaboration } from './collaboration.entity';
import { BrandsModule } from '../brands/brands.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collaboration]),
    forwardRef(() => BrandsModule),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule],
})
export class CollaborationsModule {}
