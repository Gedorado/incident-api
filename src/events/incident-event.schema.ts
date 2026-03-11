import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'incident_events' })
export class IncidentEvent extends Document {
  @Prop({ required: true })
  incidentId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  occurredAt: Date;

  @Prop({ type: Object })
  payload: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const IncidentEventSchema =
  SchemaFactory.createForClass(IncidentEvent);
