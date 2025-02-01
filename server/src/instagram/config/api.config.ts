import { registerAs } from '@nestjs/config';

export const instagramApiConfig = registerAs('instagram', () => ({
  rapidApiKey: process.env.RAPID_API_KEY,
  endpoints: {
    scraper: {
      baseUrl: process.env.INSTAGRAM_SCRAPER_BASE_URL || 'https://instagram-scraper-api2.p.rapidapi.com',
      host: process.env.INSTAGRAM_SCRAPER_HOST || 'instagram-scraper-api2.p.rapidapi.com'
    },
    analytics: {
      baseUrl: process.env.INSTAGRAM_ANALYTICS_BASE_URL || 'https://instagram-statistics-api.p.rapidapi.com',
      host: process.env.INSTAGRAM_ANALYTICS_HOST || 'instagram-statistics-api.p.rapidapi.com'
    }
  }
})); 