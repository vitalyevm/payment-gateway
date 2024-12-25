import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // your root module

describe('Payment E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/payments (POST) => 201, create payment', async () => {
    const payload = {
      checkoutUuid: 'checkout-e2e-1',
      fromAcct: 'acctX',
      toAcct: 'acctY',
      amount: '50',
      currency: 'USD',
    };
    const res = await request(app.getHttpServer())
      .post('/payments')
      .send(payload)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('COMPLETED'); // or 'PENDING', depends on your flow
  });

  it('/payments/:id (GET) => 200, get payment by id', async () => {
    // you might first create a payment then fetch it
    const createRes = await request(app.getHttpServer())
      .post('/payments')
      .send({
        checkoutUuid: 'checkout-e2e-2',
        fromAcct: 'acctX',
        toAcct: 'acctY',
        amount: '75',
        currency: 'USD',
      })
      .expect(201);

    const newPaymentId = createRes.body.id;
    const getRes = await request(app.getHttpServer())
      .get(`/payments/${newPaymentId}`)
      .expect(200);

    expect(getRes.body.id).toBe(newPaymentId);
    expect(getRes.body.amount).toBe('75');
  });
});
