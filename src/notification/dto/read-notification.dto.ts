import { IsIn, IsNumber } from 'class-validator';

export class ReadNotificationDto {
  @IsNumber()
  @IsIn([1])
  read: number;
}
