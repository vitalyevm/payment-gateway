// src/modules/payment/services/wallet.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from '../schemas/wallet.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}

  async findWalletByUserId(userId: string): Promise<WalletDocument> {
    return this.walletModel.findOne({ userId }).exec();
  }

  async findWalletByAccountId(accountId: string): Promise<WalletDocument> {
    return this.walletModel.findOne({ accountId }).exec();
  }

  /**
   * Create a wallet for a user. If you want multiple wallets per user, adjust logic.
   */
  async createWalletForUser(userId: string): Promise<WalletDocument> {
    // Generate a unique accountId (this is just an example)
    const accountId = `acct_${userId}`;

    // Optional: check if a wallet already exists
    const existing = await this.findWalletByUserId(userId);
    if (existing) {
      // If your logic wants to prevent duplicates, you could throw an error or simply return.
      // We'll return the existing wallet in this example:
      return existing;
    }

    const walletData: Partial<Wallet> = {
      userId,
      accountId,
      balance: 0, // Start with 0
      createdAt: new Date(),
    };

    const newWallet = new this.walletModel(walletData);
    return newWallet.save();
  }

  async updateBalance(accountId: string, amountStr: string) {
    const wallet = await this.findWalletByAccountId(accountId);
    if (!wallet) {
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount)) {
      throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
    }

    wallet.balance += parsedAmount;
    await wallet.save();
    return wallet;
  }
}
