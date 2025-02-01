import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowersHistory } from './followers_history.entity';
import { User } from '../user/user.entity';

@Injectable()
export class FollowersHistoryService {
  constructor(
    @InjectRepository(FollowersHistory)
    private readonly followersHistoryRepository: Repository<FollowersHistory>,
  ) {}

  async trackFollowersChange(
    user: User,
    currentCount: number,
    gainedCount: number,
    lostCount: number
  ): Promise<FollowersHistory> {
    const history = new FollowersHistory();
    history.user = user;
    history.count = currentCount;
    history.gainedCount = gainedCount;
    history.lostCount = lostCount;
    history.growthRate = gainedCount > 0 ? (gainedCount / currentCount) * 100 : 0;

    return this.followersHistoryRepository.save(history);
  }

  async getFollowersHistory(userId: number): Promise<FollowersHistory[]> {
    return this.followersHistoryRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
    });
  }

  async getGrowthRate(userId: number, days: number = 30): Promise<number> {
    const history = await this.followersHistoryRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
      take: days,
    });

    if (history.length < 2) return 0;

    const oldestCount = history[history.length - 1].count;
    const newestCount = history[0].count;
    const growth = newestCount - oldestCount;
    
    return (growth / oldestCount) * 100;
  }

  async getLatestFollowersCount(userId: number): Promise<number> {
    const latest = await this.followersHistoryRepository.findOne({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
    });
    return latest?.count || 0;
  }
} 