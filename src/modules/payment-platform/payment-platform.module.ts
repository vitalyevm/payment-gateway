import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from '../controllers/payment.controller';
import { ScheduledPaymentController } from '../controllers/scheduled-payment.controller';

// Schemas
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { LedgerEntry, LedgerEntrySchema } from '../schemas/ledger.schema';

// Services
import { LedgerService } from '../services/ledger.service';
import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';
import { PaymentProcessingService } from '../services/payment-processing.service';
import { PaymentService } from '../services/payment.service';
import { RiskEngineService } from '../services/risk-engine.service';
import { WalletService } from '../services/wallet.service';

// Repositories
import { PaymentRepository } from '../repositories/payment.repository';
import { LedgerRepository } from '../repositories/ledger.repository';

@Module({
  imports: [
    // Register Mongoose schemas
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: LedgerEntry.name, schema: LedgerEntrySchema },
    ]),
  ],
  controllers: [PaymentController, ScheduledPaymentController],
  providers: [
    PaymentService,
    PaymentOrchestratorService,
    RiskEngineService,
    PaymentProcessingService,
    WalletService,
    LedgerService,
    PaymentRepository,
    LedgerRepository,
  ],
  exports: [
    // Export any providers needed outside
    PaymentService,
    PaymentOrchestratorService,
  ],
})
export class PaymentPlatformModule {}
