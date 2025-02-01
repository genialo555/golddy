import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KPIFinancier } from './kpi_financier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KPIFinancier])],
  exports: [TypeOrmModule]
})
export class KpiFinancierModule {}
