import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsExist({ tableName: 'payment_option', column: 'id' })
  @IsNumber()
  paymentOptionId: number;

  @IsNotEmpty()
  @IsString()
  BCNO: string;
}
