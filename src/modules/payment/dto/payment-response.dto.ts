import { IsString } from 'class-validator';

export class PaymentResponseDto {
  @IsString()
  id: string;

  @IsString()
  fromAcct: string;

  @IsString()
  toAcct: string;

  @IsString()
  amount: string;

  @IsString()
  currency: string;
  
  @IsString()
  status: string;

  @IsString()
  createdAt: Date;
}
