import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentPlatformModule } from './modules/payment-platform/payment-platform.module';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    // Loads environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connect to MongoDB
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/payments_db',
    ),

    // Connect to Redis
    RedisModule,
    // Our Payment Platform monolithic module
    PaymentPlatformModule,
  ],
})
export class AppModule {}
