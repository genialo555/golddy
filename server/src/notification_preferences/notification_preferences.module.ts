import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreferences } from './notification_preferences.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreferences])],
  exports: [TypeOrmModule]
})
export class NotificationPreferencesModule {}
