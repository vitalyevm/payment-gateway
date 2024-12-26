import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from 'src/modules/user/respositories/user.repository';
import { AuthService } from 'src/modules/user/services/auth.service';
import { UserService } from 'src/modules/user/services/user.service';
import { WalletService } from 'src/modules/payment/services/wallet.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepo: UserRepository;
  let authService: AuthService;
  let walletService: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
            comparePasswords: jest.fn(),
            generateJwtToken: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepo = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
    walletService = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('registerUser', () => {
    it('should throw conflict if email in use', async () => {
      (userRepo.findByEmail as jest.Mock).mockResolvedValue({ _id: 'u1' });
      await expect(
        userService.registerUser({
          email: 'test@example.com',
          password: 'somepass',
          name: 'Tester',
        }),
      ).rejects.toThrowError(
        new HttpException('Email already in use', HttpStatus.CONFLICT),
      );
    });

    it('should create user and call createWalletForUser', async () => {
      (userRepo.findByEmail as jest.Mock).mockResolvedValue(null);
      (authService.hashPassword as jest.Mock).mockResolvedValue('hashedPass');
      (userRepo.createUser as jest.Mock).mockResolvedValue({
        _id: 'uNew',
        email: 'new@example.com',
        password: 'hashedPass',
        name: 'NewUser',
      });

      (walletService.createWalletForUser as jest.Mock).mockResolvedValue({
        _id: 'walletId',
        userId: 'uNew',
        accountId: 'acct_uNew',
        balance: 0,
      });

      const result = await userService.registerUser({
        email: 'new@example.com',
        password: 'somepass',
        name: 'NewUser',
      });

      // Ensure user is created
      expect(userRepo.createUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'hashedPass',
        name: 'NewUser',
      });

      // Ensure wallet is created
      expect(walletService.createWalletForUser).toHaveBeenCalledWith('uNew');

      // Check the result
      expect(result.email).toBe('new@example.com');
      expect(result.id).toBe('uNew');
    });
  });

  describe('loginUser', () => {
    it('should throw if user not found', async () => {
      (userRepo.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        userService.loginUser({
          email: 'notfound@example.com',
          password: 'test',
        }),
      ).rejects.toThrowError(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw if password does not match', async () => {
      (userRepo.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'u1',
        email: 'test@example.com',
        password: 'someHash',
      });
      (authService.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.loginUser({
          email: 'test@example.com',
          password: 'wrongpass',
        }),
      ).rejects.toThrowError(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return token & user if login success', async () => {
      (userRepo.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'u1',
        email: 'test@example.com',
        password: 'someHash',
        name: 'Tester',
      });
      (authService.comparePasswords as jest.Mock).mockResolvedValue(true);
      (authService.generateJwtToken as jest.Mock).mockResolvedValue(
        'jwtToken123',
      );

      const result = await userService.loginUser({
        email: 'test@example.com',
        password: 'test1234',
      });
      expect(result.token).toBe('jwtToken123');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update name', async () => {
      (authService.hashPassword as jest.Mock).mockResolvedValue('hashedPwd');
      (userRepo.updateUser as jest.Mock).mockResolvedValue({
        _id: 'u1',
        email: 'test@example.com',
        name: 'New Name',
        password: 'someHash',
        createdAt: new Date(),
      });

      const result = await userService.updateProfile('u1', {
        name: 'New Name',
      });
      expect(result.name).toBe('New Name');
    });

    it('should throw if user not found', async () => {
      (userRepo.updateUser as jest.Mock).mockResolvedValue(null);
      await expect(
        userService.updateProfile('fakeUser', { name: 'does not matter' }),
      ).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getUserById', () => {
    it('should throw if user not found', async () => {
      (userRepo.findById as jest.Mock).mockResolvedValue(null);
      await expect(userService.getUserById('nonExistent')).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should return user if found', async () => {
      (userRepo.findById as jest.Mock).mockResolvedValue({
        _id: 'u1',
        email: 'test@example.com',
        name: 'Test',
        password: 'someHash',
        createdAt: new Date(),
      });
      const user = await userService.getUserById('u1');
      expect(user.email).toBe('test@example.com');
    });
  });
});
