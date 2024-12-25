import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
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

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // 1. Idempotency check
    const existingPayment = await this.paymentService.findByCheckoutUuid(
      dto.checkoutUuid,
    );
    if (existingPayment) {
      throw new HttpException('Duplicate payment request', HttpStatus.CONFLICT);
    }

    // 2. Create Payment record in DB (status: PENDING)
    const newPayment: PaymentDocument = await this.paymentService.create(dto);
    const paymentIdStr = newPayment._id.toString();

    // 3. Risk check
    const riskResult = await this.riskEngine.evaluate(newPayment);
    if (!riskResult.approved) {
      // Mark payment as REJECTED and return
      await this.paymentService.updateStatus(paymentIdStr, 'REJECTED');
      throw new HttpException(
        'Payment rejected by risk engine',
        HttpStatus.FORBIDDEN,
      );
    }

    // 4. Attempt Payment Processing with PSP
    const pspResult = await this.processing.processPayment(newPayment);
    if (!pspResult.success) {
      // Mark payment as FAILED
      await this.paymentService.updateStatus(paymentIdStr, 'FAILED');
      throw new HttpException('PSP payment failed', HttpStatus.BAD_GATEWAY);
    }

    // 5. Update ledger (double-entry) & wallet
    // Debit from from_acct, credit to to_acct
    await this.ledger.recordTransaction({
      paymentId: paymentIdStr,
      fromAcct: dto.fromAcct,
      toAcct: dto.toAcct,
      amount: dto.amount,
      currency: dto.currency,
    });

    // Update Wallet (for example, if user’s wallet is credited)
    await this.wallet.updateBalance(dto.toAcct, dto.amount);

    // 6. Mark Payment as COMPLETE
    await this.paymentService.updateStatus(paymentIdStr, 'COMPLETED');

    // 7. Return final Payment object
    return await this.paymentService.buildPaymentResponse(paymentIdStr);
  }

  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    return this.paymentService.buildPaymentResponse(paymentId);
  }

  // The following methods handle scheduled-payment flows
  async createScheduledPayment(dto: any) {
    // store schedule info in DB
  }

  async getScheduledPayment(id: string) {
    /* ... */
  }
  async updateScheduledPayment(id: string, dto: any) {
    /* ... */
  }
  async deleteScheduledPayment(id: string) {
    /* ... */
  }
}
