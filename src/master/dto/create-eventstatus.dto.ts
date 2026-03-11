import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';

export class CreateEventStatusDto {
  @IsNotEmpty()
  @IsNumber()
  @IsExist({ tableName: 'event', column: 'id' }) 
  eventId: number;

  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'event_status', column: 'status' })
  status: string;
}
