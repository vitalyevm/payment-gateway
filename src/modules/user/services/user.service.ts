// src/modules/user/services/user.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../respositories/user.repository';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthService } from './auth.service';
import { UserDocument } from '../schemas/user.schema';
import { UserResponseDto } from '../dto/user-response.dto';
import { WalletService } from 'src/modules/payment/services/wallet.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly authService: AuthService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Registration flow
   */
  async registerUser(dto: RegisterUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new HttpException('Email already in use', HttpStatus.CONFLICT);
    }

    // 1. Hash password and create user
    const hashedPassword = await this.authService.hashPassword(dto.password);
    const user = await this.userRepo.createUser({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    // 2. Create a wallet for the new user
    await this.walletService.createWalletForUser(user._id.toString());

    return this.toUserResponse(user);
  }

  /**
   * Login flow
   */
  async loginUser(
    dto: LoginUserDto,
  ): Promise<{ token: string; user: UserResponseDto }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Check password
    const passwordMatches = await this.authService.comparePasswords(
      dto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT
    const token = await this.authService.generateJwtToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      token,
      user: this.toUserResponse(user),
    };
  }

  /**
   * Edit profile (name, password, etc.)
   */
  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updates: any = {};
    if (dto.name) updates.name = dto.name;
    if (dto.password) {
      updates.password = await this.authService.hashPassword(dto.password);
    }

    const updatedUser = await this.userRepo.updateUser(userId, updates);
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.toUserResponse(updatedUser);
  }

  /**
   * Return user info from DB
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.toUserResponse(user);
  }

  /**
   * Transform a UserDocument to a UserResponseDto
   */
  private toUserResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
