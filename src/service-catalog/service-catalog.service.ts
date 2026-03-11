import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ServiceCatalogService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl =
      process.env.SERVICE_CATALOG_BASE_URL || 'http://localhost:3001';
  }

  async getService(
    serviceId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/services/${serviceId}`),
      );
      return { success: true, data: response.data };
    } catch (err) {
      const error = err as AxiosError;
      return { success: false, error: error.message };
    }
  }
}
