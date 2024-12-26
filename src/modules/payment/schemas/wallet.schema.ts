// src/modules/payment/schemas/wallet.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'wallets' })
export class Wallet {
  _id: Types.ObjectId;

  @Prop()
  userId: string;

  @Prop()
  accountId: string; // e.g. "acct_000123"

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type WalletDocument = Wallet & Document;
export const WalletSchema = SchemaFactory.createForClass(Wallet);
