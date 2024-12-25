import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'ledgerEntries' })
export class LedgerEntry {
  @Prop()
  paymentId: string;

  @Prop()
  account: string;

  @Prop()
  amount: string; // negative or positive

  @Prop()
  currency: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type LedgerEntryDocument = LedgerEntry & Document;
export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);
