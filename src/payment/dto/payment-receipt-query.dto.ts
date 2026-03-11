import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentReceiptQueryDto {
  @IsNotEmpty()
  @IsString()
  receiptHeaderId: string;
}
