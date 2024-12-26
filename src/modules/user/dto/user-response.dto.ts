// src/modules/user/dto/user-response.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class UserResponseDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  createdAt: Date;
}
