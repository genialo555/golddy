import { Injectable } from '@nestjs/common';
import { InstagramBaseService } from './base.service';
import { Demographics } from '../../demographics/demographics.entity';
import { FollowersHistory } from '../../followers_history/followers_history.entity';

interface InstagramCountry {
  name: string;
  percentage: number;
}

interface InstagramCity {
  name: string;
  country?: string;
  percentage: number;
}

@Injectable()
export class InstagramAnalyticsService extends InstagramBaseService {
  async getCommunityInsights(username: string) {
    return this.makeRequest('/community', 'analytics', {
      url: `https://www.instagram.com/${username}/`
    });
  }

  async transformAnalytics(data: any) {
    const demographics = new Demographics();
    demographics.ageDistribution = this.transformAgeDistribution(data.ageRanges);
    demographics.genderDistribution = {
      male: data.genderDistribution?.male || 0,
      female: data.genderDistribution?.female || 0,
      other: data.genderDistribution?.other || 0
    };
    demographics.topCountries = data.topCountries?.map((country: InstagramCountry) => ({
      country: country.name,
      percentage: country.percentage,
      count: Math.round((country.percentage / 100) * data.usersCount)
    })) || [];
    demographics.topCities = data.topCities?.map((city: InstagramCity) => ({
      city: city.name,
      country: city.country || 'Unknown',
      percentage: city.percentage,
      count: Math.round((city.percentage / 100) * data.usersCount)
    })) || [];
    demographics.totalFollowers = data.usersCount;
    demographics.engagementRate = data.avgER;
    demographics.verifiedFollowersPercentage = 100 - (data.pctFakeFollowers || 0);
    demographics.reach = data.reach;

    const followersHistory = new FollowersHistory();
    followersHistory.count = data.usersCount;

    return {
      demographics,
      followersHistory,
      engagement: {
        rate: data.avgER,
        averageInteractions: data.avgInteractions,
        averageLikes: data.avgLikes,
        averageComments: data.avgComments
      },
      audience: {
        qualityScore: data.qualityScore,
        fakefollowersPercentage: data.pctFakeFollowers,
        totalFollowers: data.usersCount
      },
      brandSafety: {
        score: data.brandSafety?.totalScore,
        adContent: data.brandSafety?.ad,
        toxicContent: data.brandSafety?.toxic
      },
      profile: {
        name: data.name,
        category: data.categories,
        country: data.country,
        type: data.type
      }
    };
  }

  private transformAgeDistribution(ageRanges: Record<string, number>) {
    return {
      '13-17': ageRanges['13-17'] || 0,
      '18-24': ageRanges['18-24'] || 0,
      '25-34': ageRanges['25-34'] || 0,
      '35-44': ageRanges['35-44'] || 0,
      '45-54': ageRanges['45-54'] || 0,
      '55+': ageRanges['55+'] || 0
    };
  }
} 