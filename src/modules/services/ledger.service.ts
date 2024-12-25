// ledger.service.ts
import { Injectable } from '@nestjs/common';
import { LedgerRepository } from '../repositories/ledger.repository';

interface LedgerTransaction {
  paymentId: string; // must be a string
  fromAcct: string;
  toAcct: string;
  amount: string;
  currency: string;
}

@Injectable()
export class LedgerService {
  constructor(private readonly ledgerRepo: LedgerRepository) {}

  async recordTransaction(tx: LedgerTransaction): Promise<void> {
    // Insert two ledger entries: negative fromAcct, positive toAcct
    await this.ledgerRepo.create({
      paymentId: tx.paymentId,
      account: tx.fromAcct,
      amount: `-${tx.amount}`,
      currency: tx.currency,
      createdAt: new Date(),
    });
    await this.ledgerRepo.create({
      paymentId: tx.paymentId,
      account: tx.toAcct,
      amount: `+${tx.amount}`,
      currency: tx.currency,
      createdAt: new Date(),
    });
  }
}
