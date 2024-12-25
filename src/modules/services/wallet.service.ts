import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  async updateBalance(accountId: string, amount: string) {
    // pseudo-code:
    // 1. find the wallet by accountId
    // 2. increment the balance
    // 3. save
  }
}
