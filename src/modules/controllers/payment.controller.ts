import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Inject,
  HttpException,
  HttpStatus,
  UseGuards,
  // ...
} from '@nestjs/common';
import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

import { AuthGuard } from '../../common/guards/auth.guard';
// Example guard (JWT-based)
//   import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) {}

  @Post()
  async createPayment(
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    try {
      // Orchestrate the entire pay-in or pay-out flow
      const paymentResult = await this.paymentOrchestrator.createPayment(dto);
      return paymentResult;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async getPayment(
    @Param('id') paymentId: string,
  ): Promise<PaymentResponseDto> {
    try {
      return await this.paymentOrchestrator.getPayment(paymentId);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND);
    }
  }
}
