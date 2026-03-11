import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class bcReceiptDto {
  @IsNotEmpty()
  @IsNumber()
  Invoice_Header_ID: number;
}
