import { Injectable } from '@nestjs/common';
import { PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class RiskEngineService {
  async evaluate(
    payment: PaymentDocument,
    userId: string, // pass userId to do "fake user validation"
  ): Promise<{ approved: boolean; reason?: string }> {
    // Fake user validation:
    if (userId === '123-banned-user-id') {
      return { approved: false, reason: 'User is banned' };
    }

    // Continue standard risk checks (e.g. amount)
    const amountNum = parseFloat(payment.amount);
    if (amountNum > 5000) {
      return { approved: false, reason: 'Amount too large' };
    }

    // If no checks fail
    return { approved: true };
  }
}
