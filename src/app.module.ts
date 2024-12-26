import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentModule } from './modules/payment/payment.module';
import { RedisModule } from './redis.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/payments_db',
    ),
    RedisModule,
    UserModule,
    PaymentModule,
  ],
})
export class AppModule {}
