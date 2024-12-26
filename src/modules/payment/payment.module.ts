// src/modules/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Payment Controllers
import { PaymentController } from './controllers/payment.controller';
import { ScheduledPaymentController } from './controllers/scheduled-payment.controller';

// Payment Schemas
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { LedgerEntry, LedgerEntrySchema } from './schemas/ledger.schema';
import { Wallet, WalletSchema } from './schemas/wallet.schema';

// Payment Services
import { PaymentService } from './services/payment.service';
import { PaymentOrchestratorService } from './services/payment-orchestrator.service';
import { PaymentProcessingService } from './services/payment-processing.service';
import { LedgerService } from './services/ledger.service';
import { RiskEngineService } from './services/risk-engine.service';
import { WalletService } from './services/wallet.service';

// Payment Repositories
import { PaymentRepository } from './repositories/payment.repository';
import { LedgerRepository } from './repositories/ledger.repository';

// Import the module that provides AuthService (and JwtService) properly
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: LedgerEntry.name, schema: LedgerEntrySchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    // Import the UserModule, which exports AuthService
    UserModule,
  ],
  controllers: [PaymentController, ScheduledPaymentController],
  providers: [
    // Payment-layer services
    PaymentService,
    PaymentOrchestratorService,
    PaymentProcessingService,
    LedgerService,
    RiskEngineService,
    WalletService,

    // Payment-layer repositories
    PaymentRepository,
    LedgerRepository,

    // REMOVE the lines:
    //    AuthService,
    //    JwtService,
    // do NOT list them here
  ],
  exports: [PaymentService, PaymentOrchestratorService],
})
export class PaymentModule {}
