import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async findByCheckoutUuid(checkoutUuid: string) {
    return this.paymentRepo.findOne({ checkoutUuid });
  }

  async create(dto: CreatePaymentDto) {
    return this.paymentRepo.create({
      ...dto,
      status: 'PENDING',
      createdAt: new Date(),
    });
  }

  async updateStatus(paymentId: string, status: string) {
    return this.paymentRepo.updateStatus(paymentId, status);
  }

  async buildPaymentResponse(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) return null;
    return {
      id: payment._id.toString(),
      fromAcct: payment.fromAcct,
      toAcct: payment.toAcct,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }
}
