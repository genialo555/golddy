import { Injectable } from '@nestjs/common';
import { InstagramBaseService } from './base.service';

interface AudienceInsights {
  ageRanges: {
    '13-17': number;
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45-54': number;
    '55+': number;
  };
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  topCountries: Array<{
    name: string;
    percentage: number;
  }>;
  topCities: Array<{
    name: string;
    country: string;
    percentage: number;
  }>;
  totalFollowers: number;
  engagementRate: number;
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
    yearToDate: number;
  };
  reach: number;
}

@Injectable()
export class InstagramScraperService extends InstagramBaseService {
  async searchUser(query: string) {
    return this.makeRequest('/v1.2/search', 'scraper', {
      search_query: query
    });
  }

  async getUserInfo(username: string) {
    return this.makeRequest('/v1.2/user/info', 'scraper', {
      username
    });
  }

  async getUserMedia(username: string) {
    return this.makeRequest('/v1.2/user/posts', 'scraper', {
      username
    });
  }

  async getUserFollowers(username: string) {
    return this.makeRequest('/v1.2/user/followers', 'scraper', {
      username
    });
  }

  async getAudienceInsights(username: string): Promise<AudienceInsights> {
    try {
      const insights = await this.makeRequest('/v1.2/user/insights', 'scraper', { username });
      
      return {
        ageRanges: insights.audience_age_ranges,
        genderDistribution: insights.audience_gender,
        topCountries: insights.audience_countries,
        topCities: insights.audience_cities,
        totalFollowers: insights.follower_count,
        engagementRate: insights.engagement_rate,
        growthRate: {
          daily: insights.growth_rate.daily,
          weekly: insights.growth_rate.weekly,
          monthly: insights.growth_rate.monthly,
          yearToDate: insights.growth_rate.year_to_date
        },
        reach: insights.reach
      };
    } catch (error) {
      this.logger.error(`Error fetching audience insights for user ${username}:`, error.stack);
      throw error;
    }
  }
} 