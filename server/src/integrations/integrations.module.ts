import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './integration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration])],
  exports: [TypeOrmModule],
})
export class IntegrationsModule {} 