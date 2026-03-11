import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServiceCatalogService } from './service-catalog.service.js';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  providers: [ServiceCatalogService],
  exports: [ServiceCatalogService],
})
export class ServiceCatalogModule {}
