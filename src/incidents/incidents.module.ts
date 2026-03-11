import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './incident.entity.js';
import { IncidentsController } from './incidents.controller.js';
import { IncidentsService } from './incidents.service.js';
import { EventsModule } from '../events/events.module.js';
import { ServiceCatalogModule } from '../service-catalog/service-catalog.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    EventsModule,
    ServiceCatalogModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
