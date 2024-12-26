// src/modules/user/user.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

// Controllers
import { UserController } from './controllers/user.controller';

// Schemas
import { User, UserSchema } from './schemas/user.schema';

// Services
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

// Repositories
import { UserRepository } from './respositories/user.repository';
import { WalletService } from '../payment/services/wallet.service';
import { Wallet, WalletSchema } from '../payment/schemas/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'MySecretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, WalletService, UserRepository],
  exports: [UserService, AuthService],
})
export class UserModule {}
