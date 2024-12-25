// payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'payments' })
export class Payment {
  _id: Types.ObjectId; // Mongoose will assign an ObjectId

  @Prop()
  checkoutUuid: string;

  @Prop()
  fromAcct: string;

  @Prop()
  toAcct: string;

  @Prop()
  amount: string;

  @Prop()
  currency: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type PaymentDocument = Payment & Document;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
