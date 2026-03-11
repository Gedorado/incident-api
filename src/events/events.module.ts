import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IncidentEvent, IncidentEventSchema } from './incident-event.schema.js';
import { EventsService } from './events.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IncidentEvent.name, schema: IncidentEventSchema },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
