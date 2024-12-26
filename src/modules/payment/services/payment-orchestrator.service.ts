// src/modules/payment/services/payment-orchestrator.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { RiskEngineService } from './risk-engine.service';
import { PaymentProcessingService } from './payment-processing.service';
import { LedgerService } from './ledger.service';
import { WalletService } from './wallet.service';
import { PaymentService } from './payment.service';
import { PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PaymentOrchestratorService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly riskEngine: RiskEngineService,
    private readonly processing: PaymentProcessingService,
    private readonly ledger: LedgerService,
    private readonly wallet: WalletService,
  ) {}

  /**
   * Orchestrate pay-in / pay-out flow
   */
  async createPayment(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentResponseDto> {
    // 1. Idempotency check
    const existingPayment = await this.paymentService.findByCheckoutUuid(
      dto.checkoutUuid,
    );
    if (existingPayment) {
      throw new HttpException('Duplicate payment request', HttpStatus.CONFLICT);
    }

    // 2. OVERRIDE fromAcct with the user's actual wallet account
    const userWallet = await this.wallet.findWalletByUserId(userId);
    if (!userWallet) {
      throw new HttpException('User has no wallet', HttpStatus.BAD_REQUEST);
    }
    dto.fromAcct = userWallet.accountId; // override

    // 3. Check if fromAcct belongs to the authenticated user
    //    (We've just set fromAcct from the userWallet, so this is just a safety check.)
    if (userWallet.userId !== userId) {
      // The user does not own fromAcct
      throw new HttpException('Unauthorized wallet', HttpStatus.FORBIDDEN);
    }

    // 4. Create Payment record in DB (status: PENDING)
    const newPayment: PaymentDocument = await this.paymentService.create(dto);
    const paymentIdStr = newPayment._id.toString();

    // 5. Risk check (FAKE user validation)
    const riskResult = await this.riskEngine.evaluate(newPayment, userId);
    if (!riskResult.approved) {
      await this.paymentService.updateStatus(paymentIdStr, 'REJECTED');
      throw new HttpException(
        'Payment rejected by risk engine',
        HttpStatus.FORBIDDEN,
      );
    }

    // 6. Attempt Payment Processing with PSP
    const pspResult = await this.processing.processPayment(newPayment);
    if (!pspResult.success) {
      await this.paymentService.updateStatus(paymentIdStr, 'FAILED');
      throw new HttpException('PSP payment failed', HttpStatus.BAD_GATEWAY);
    }

    // 7. Update ledger (double-entry)
    await this.ledger.recordTransaction({
      paymentId: paymentIdStr,
      fromAcct: dto.fromAcct,
      toAcct: dto.toAcct,
      amount: dto.amount,
      currency: dto.currency,
    });

    // 8. Update wallets (debit/credit)
    await this.wallet.updateBalance(dto.fromAcct, `-${dto.amount}`);
    await this.wallet.updateBalance(dto.toAcct, `+${dto.amount}`);

    // 9. Mark Payment as COMPLETED
    await this.paymentService.updateStatus(paymentIdStr, 'COMPLETED');

    // 10. Return final Payment object
    return await this.paymentService.buildPaymentResponse(paymentIdStr);
  }

  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    return this.paymentService.buildPaymentResponse(paymentId);
  }

  // Scheduled payment methods...
}
