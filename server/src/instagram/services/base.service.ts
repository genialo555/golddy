import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramBaseService {
  protected readonly logger = new Logger(InstagramBaseService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  protected async makeRequest(
    endpoint: string,
    apiType: 'scraper' | 'analytics',
    params: Record<string, any> = {}
  ) {
    try {
      const config = this.configService.get('instagram');
      const apiConfig = config.endpoints[apiType];
      
      const response = await firstValueFrom(
        this.httpService.get(`${apiConfig.baseUrl}${endpoint}`, {
          params,
          headers: {
            'X-RapidAPI-Key': config.rapidApiKey,
            'X-RapidAPI-Host': apiConfig.host,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Instagram API Error: ${error.message}`, error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Instagram API Error',
        error.response?.status || 500
      );
    }
  }
} 