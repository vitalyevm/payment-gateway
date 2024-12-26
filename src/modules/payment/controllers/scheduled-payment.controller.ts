import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';

@Controller('scheduled-payments')
export class ScheduledPaymentController {
  constructor(
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) {}

  // @Post()
  // async createScheduledPayment(@Body() dto: any) {
  //   // e.g., date/frequency stored in DB
  //   return await this.paymentOrchestrator.createScheduledPayment(dto);
  // }

  // @Get(':id')
  // async getScheduledPayment(@Param('id') id: string) {
  //   return await this.paymentOrchestrator.getScheduledPayment(id);
  // }

  // @Put(':id')
  // async updateScheduledPayment(@Param('id') id: string, @Body() dto: any) {
  //   return await this.paymentOrchestrator.updateScheduledPayment(id, dto);
  // }

  // @Delete(':id')
  // async deleteScheduledPayment(@Param('id') id: string) {
  //   return await this.paymentOrchestrator.deleteScheduledPayment(id);
  // }
}
