// src/modules/user/controllers/user.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
// Suppose AuthGuard decodes JWT and attaches user info to request
//   request.user = { userId, email }

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.userService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.userService.loginUser(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    // req.user is populated by AuthGuard after validating JWT
    const userId = req.user.userId;
    return this.userService.getUserById(userId);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user.userId;
    return this.userService.updateProfile(userId, dto);
  }
}
