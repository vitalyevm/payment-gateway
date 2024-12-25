import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from 'src/modules/controllers/payment.controller';
import { CreatePaymentDto } from 'src/modules/dto/create-payment.dto';
import { PaymentOrchestratorService } from 'src/modules/services/payment-orchestrator.service';

describe('PaymentController (Unit)', () => {
  let controller: PaymentController;
  let orchestratorService: Partial<PaymentOrchestratorService>;

  beforeEach(async () => {
    orchestratorService = {
      createPayment: jest.fn().mockResolvedValue({
        id: 'payment123',
        fromAcct: 'acctA',
        toAcct: 'acctB',
        amount: '100',
        currency: 'USD',
        status: 'COMPLETED',
        createdAt: new Date(),
      }),
      getPayment: jest.fn().mockResolvedValue({
        id: 'payment123',
        fromAcct: 'acctA',
        toAcct: 'acctB',
        amount: '100',
        currency: 'USD',
        status: 'COMPLETED',
        createdAt: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentOrchestratorService,
          useValue: orchestratorService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should create payment successfully', async () => {
    const dto: CreatePaymentDto = {
      checkoutUuid: 'checkout-uuid-1',
      fromAcct: 'acctA',
      toAcct: 'acctB',
      amount: '100',
      currency: 'USD',
    };

    const result = await controller.createPayment(dto);

    expect(orchestratorService.createPayment).toHaveBeenCalledWith(dto);
    expect(result.id).toBe('payment123');
    expect(result.status).toBe('COMPLETED');
  });

  it('should get payment by id', async () => {
    const result = await controller.getPayment('payment123');
    expect(orchestratorService.getPayment).toHaveBeenCalledWith('payment123');
    expect(result.id).toBe('payment123');
    expect(result.status).toBe('COMPLETED');
  });
});
