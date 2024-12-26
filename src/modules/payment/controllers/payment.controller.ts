// src/modules/payment/controllers/payment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) {}

  @Post()
  async createPayment(
    @Req() req: any,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    try {
      const userId = req.user.userId; // AuthGuard sets req.user
      const paymentResult = await this.paymentOrchestrator.createPayment(
        dto,
        userId,
      );
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
