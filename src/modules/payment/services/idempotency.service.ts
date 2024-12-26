// src/modules/payment-platform/services/idempotency.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async checkAndSet(key: string): Promise<boolean> {
    // If you pass 'NX', 'EX' positionally, you can get TS errors.
    // Instead, pass an options object OR cast to unknown as needed.
    // This approach uses the older ioredis style:
    const result = await this.redisClient.set(key, '1');
    // ioredis returns 'OK' if it set the key, or null if it didn't
    return result === 'OK';
  }

  // or the newer options-based approach:
  // const result = await this.redisClient.set(key, '1', {
  //   NX: true,
  //   EX: 300,
  // });
  // return result !== null;
}
