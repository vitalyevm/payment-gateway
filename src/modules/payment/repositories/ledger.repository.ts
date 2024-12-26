import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LedgerEntry, LedgerEntryDocument } from '../schemas/ledger.schema';

@Injectable()
export class LedgerRepository {
  constructor(
    @InjectModel(LedgerEntry.name)
    private readonly ledgerModel: Model<LedgerEntryDocument>,
  ) {}

  async create(data: Partial<LedgerEntry>): Promise<LedgerEntryDocument> {
    return new this.ledgerModel(data).save();
  }
}
