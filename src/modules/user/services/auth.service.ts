// src/modules/user/services/auth.service.ts

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10; // Adjust as needed

  constructor(private readonly jwtService: JwtService) {}

  // Hash the user's password
  async hashPassword(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, this.saltRounds);
  }

  // Compare a plain password to a stored hash
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Sign a JWT token with a user payload
  async generateJwtToken(payload: {
    userId: string;
    email: string;
  }): Promise<string> {
    return this.jwtService.sign(payload);
  }

  // Validate JWT token manually (if needed)
  async verifyJwtToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }
}
