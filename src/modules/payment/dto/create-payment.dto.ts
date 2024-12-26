import { IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  checkoutUuid: string;

  @IsString()
  fromAcct: string;

  @IsString()
  toAcct: string;

  // If you declared amount as a numeric type or used @IsNumber(), 
  // but you’re sending a string like "100", this can fail. 
  // Adjust as needed:
  @IsString()
  amount: string;

  @IsString()
  currency: string;
}
