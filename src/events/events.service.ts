import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IncidentEvent } from './incident-event.schema.js';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(IncidentEvent.name)
    private readonly eventModel: Model<IncidentEvent>,
  ) {}

  async create(
    incidentId: string,
    type: string,
    payload: any,
    metadata?: any,
  ): Promise<IncidentEvent> {
    const event = new this.eventModel({
      incidentId,
      type,
      occurredAt: new Date(),
      payload,
      metadata: metadata ?? {},
    });
    return event.save();
  }

  async findByIncidentId(incidentId: string): Promise<IncidentEvent[]> {
    return this.eventModel
      .find({ incidentId })
      .sort({ occurredAt: 1 })
      .exec();
  }
}
