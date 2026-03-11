import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import Redis from 'ioredis';

@Injectable()
export class ServiceCatalogService {
  private readonly logger = new Logger(ServiceCatalogService.name);
  private readonly baseUrl: string;
  private readonly redis: Redis | null;
  private readonly cacheTtl = 300; // 5 minutes

  constructor(private readonly httpService: HttpService) {
    this.baseUrl =
      process.env.SERVICE_CATALOG_BASE_URL || 'http://localhost:3001';

    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        lazyConnect: true,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
      });
      this.redis.connect().catch(() => {
        this.logger.warn('Redis not available, caching disabled');
      });
    } catch {
      this.logger.warn('Redis init failed, caching disabled');
      this.redis = null;
    }
  }

  async getService(
    serviceId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const cacheKey = `service:${serviceId}`;

    // Try cache first
    try {
      if (this.redis?.status === 'ready') {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          this.logger.log(`Cache hit for ${serviceId}`);
          return JSON.parse(cached);
        }
      }
    } catch {
      this.logger.warn('Redis read failed, skipping cache');
    }

    // Fetch from service
    let result: { success: boolean; data?: any; error?: string };
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/services/${serviceId}`),
      );
      result = { success: true, data: response.data };
    } catch (err) {
      const error = err as AxiosError;
      result = { success: false, error: error.message };
    }

    // Save to cache
    try {
      if (this.redis?.status === 'ready') {
        await this.redis.setex(cacheKey, this.cacheTtl, JSON.stringify(result));
        this.logger.log(`Cached ${serviceId} with TTL ${this.cacheTtl}s`);
      }
    } catch {
      this.logger.warn('Redis write failed, skipping cache');
    }

    return result;
  }
}
