// src/modules/payment/services/payment-orchestrator.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LedgerService } from 'src/modules/payment/services/ledger.service';
import { PaymentOrchestratorService } from 'src/modules/payment/services/payment-orchestrator.service';
import { PaymentProcessingService } from 'src/modules/payment/services/payment-processing.service';
import { PaymentService } from 'src/modules/payment/services/payment.service';
import { RiskEngineService } from 'src/modules/payment/services/risk-engine.service';
import { WalletService } from 'src/modules/payment/services/wallet.service';

describe('PaymentOrchestratorService', () => {
  let service: PaymentOrchestratorService;
  let paymentService: PaymentService;
  let walletService: WalletService;
  let riskEngine: RiskEngineService;
  let processingService: PaymentProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentOrchestratorService,
        {
          provide: PaymentService,
          useValue: {
            findByCheckoutUuid: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
            buildPaymentResponse: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {
            findWalletByUserId: jest.fn(),
            updateBalance: jest.fn(),
          },
        },
        {
          provide: RiskEngineService,
          useValue: {
            evaluate: jest.fn(),
          },
        },
        {
          provide: PaymentProcessingService,
          useValue: {
            processPayment: jest.fn(),
          },
        },
        {
          provide: LedgerService,
          useValue: {
            recordTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentOrchestratorService>(
      PaymentOrchestratorService,
    );
    paymentService = module.get<PaymentService>(PaymentService);
    walletService = module.get<WalletService>(WalletService);
    riskEngine = module.get<RiskEngineService>(RiskEngineService);
    processingService = module.get<PaymentProcessingService>(
      PaymentProcessingService,
    );
    ledgerService = module.get<LedgerService>(LedgerService);
  });

  describe('createPayment', () => {
    it('should override fromAcct with user wallet accountId', async () => {
      // Mocks
      (paymentService.findByCheckoutUuid as jest.Mock).mockResolvedValue(null); // No duplicate
      (walletService.findWalletByUserId as jest.Mock).mockResolvedValue({
        userId: 'user123',
        accountId: 'acct_user_123',
      });
      (paymentService.create as jest.Mock).mockResolvedValue({
        _id: 'payment001',
        fromAcct: 'acct_user_123',
        toAcct: 'acct_user_002',
        amount: '100',
        currency: 'USD',
        status: 'PENDING',
      });
      (riskEngine.evaluate as jest.Mock).mockResolvedValue({ approved: true });
      (processingService.processPayment as jest.Mock).mockResolvedValue({
        success: true,
      });
      (paymentService.buildPaymentResponse as jest.Mock).mockResolvedValue({
        id: 'payment001',
        fromAcct: 'acct_user_123',
        toAcct: 'acct_user_002',
        amount: '100',
        currency: 'USD',
        status: 'COMPLETED',
        createdAt: new Date(),
      });

      // Act
      const dto = {
        checkoutUuid: 'ck123-abc',
        fromAcct: 'someFakeAcct',
        toAcct: 'acct_user_002',
        amount: '100',
        currency: 'USD',
      };
      const result = await service.createPayment(dto, 'user123');

      // Assert
      expect(walletService.findWalletByUserId).toHaveBeenCalledWith('user123');
      // The actual create call to paymentService should reflect the overridden fromAcct
      expect(paymentService.create).toHaveBeenCalledWith({
        checkoutUuid: 'ck123-abc',
        fromAcct: 'acct_user_123', // Overridden
        toAcct: 'acct_user_002',
        amount: '100',
        currency: 'USD',
      });
      expect(result.fromAcct).toBe('acct_user_123');
    });

    it('should throw 400 if user has no wallet', async () => {
      (paymentService.findByCheckoutUuid as jest.Mock).mockResolvedValue(null); // No duplicate
      (walletService.findWalletByUserId as jest.Mock).mockResolvedValue(null); // No wallet

      const dto = {
        checkoutUuid: 'ck123-abc',
        fromAcct: 'ignoredAcct', // Will be overridden, but user has no wallet
        toAcct: 'acct_user_002',
        amount: '100',
        currency: 'USD',
      };

      await expect(service.createPayment(dto, 'user123')).rejects.toThrowError(
        new HttpException('User has no wallet', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw conflict if payment with same checkoutUuid already exists', async () => {
      (paymentService.findByCheckoutUuid as jest.Mock).mockResolvedValue({
        _id: 'p1',
      });
      const dto = {
        checkoutUuid: 'ck123-abc',
        fromAcct: 'whatever',
        toAcct: 'acct_user_002',
        amount: '50',
        currency: 'USD',
      };

      await expect(service.createPayment(dto, 'user123')).rejects.toThrowError(
        new HttpException('Duplicate payment request', HttpStatus.CONFLICT),
      );
    });

    it('should throw 403 if risk engine is not approved', async () => {
      (paymentService.findByCheckoutUuid as jest.Mock).mockResolvedValue(null);
      (walletService.findWalletByUserId as jest.Mock).mockResolvedValue({
        userId: 'user123',
        accountId: 'acct_user_123',
      });
      (paymentService.create as jest.Mock).mockResolvedValue({ _id: 'p2' });
      (riskEngine.evaluate as jest.Mock).mockResolvedValue({ approved: false });

      const dto = {
        checkoutUuid: 'ck123-xyz',
        fromAcct: 'ignored',
        toAcct: 'acct_user_999',
        amount: '200',
        currency: 'USD',
      };

      await expect(service.createPayment(dto, 'user123')).rejects.toThrowError(
        new HttpException(
          'Payment rejected by risk engine',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });
});
