import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  Wallet,
  WalletDocument,
} from 'src/modules/payment/schemas/wallet.schema';
import { WalletService } from 'src/modules/payment/services/wallet.service';

const mockWalletDoc = (
  walletData?: Partial<Wallet>,
): Partial<WalletDocument> => ({
  _id: 'wallet123',
  userId: 'userABC',
  accountId: 'acct_user_001',
  balance: 100,
  ...walletData,
});

describe('WalletService', () => {
  let service: WalletService;
  let walletModel: Model<WalletDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getModelToken(Wallet.name),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletModel = module.get<Model<WalletDocument>>(getModelToken(Wallet.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWalletForUser', () => {
    it('should return existing wallet if user already has one', async () => {
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'existingWallet',
          userId: 'u123',
          accountId: 'acct_u123',
          balance: 0,
        }),
      });

      const result = await service.createWalletForUser('u123');
      expect(result._id).toBe('existingWallet');
      // no new wallet is created
    });

    it('should create new wallet if user has none', async () => {
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // no existing wallet
      });

      const mockSave = jest.fn().mockResolvedValue({
        _id: 'newWalletId',
        userId: 'u123',
        accountId: 'acct_u123',
        balance: 0,
      });
      // Mongoose usage typically: `new this.walletModel(walletData).save()`
      (walletModel as any).mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.createWalletForUser('u123');
      expect(result._id).toBe('newWalletId');
      expect(result.userId).toBe('u123');
      expect(result.accountId).toBe('acct_u123');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('findWalletByAccountId', () => {
    it('should return a wallet document if found', async () => {
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWalletDoc()),
      });

      const wallet = await service.findWalletByAccountId('acct_user_001');
      expect(wallet.accountId).toEqual('acct_user_001');
    });

    it('should return null if not found', async () => {
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const wallet = await service.findWalletByAccountId('acct_user_999');
      expect(wallet).toBeNull();
    });
  });

  describe('updateBalance', () => {
    it('should increment balance properly (positive)', async () => {
      const fakeWallet = mockWalletDoc({ balance: 100 });
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(fakeWallet),
      });

      // Mock .save() on the wallet doc
      fakeWallet.save = jest.fn().mockResolvedValue({
        ...fakeWallet,
        balance: 150,
      });

      const result = await service.updateBalance('acct_user_001', '+50');
      expect(result.balance).toBe(150);
    });

    it('should decrement balance properly (negative)', async () => {
      const fakeWallet = mockWalletDoc({ balance: 100 });
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(fakeWallet),
      });

      fakeWallet.save = jest.fn().mockResolvedValue({
        ...fakeWallet,
        balance: 70,
      });

      const result = await service.updateBalance('acct_user_001', '-30');
      expect(result.balance).toBe(70);
    });

    it('should throw 404 if wallet not found', async () => {
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.updateBalance('acct_unknown', '50'),
      ).rejects.toThrowError(
        new HttpException('Wallet not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw 400 if amount invalid', async () => {
      const fakeWallet = mockWalletDoc({ balance: 100 });
      (walletModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(fakeWallet),
      });
      await expect(
        service.updateBalance('acct_user_001', 'not a number'),
      ).rejects.toThrowError(
        new HttpException('Invalid amount', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
