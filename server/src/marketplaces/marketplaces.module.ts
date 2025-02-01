import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marketplace } from './marketplace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Marketplace])],
  exports: [TypeOrmModule],
})
export class MarketplacesModule {} 