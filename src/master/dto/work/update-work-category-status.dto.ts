import { IsIn, IsNumber } from 'class-validator';

export class UpdateWorkCategoryStatus {
  @IsNumber()
  @IsIn([1, 0])
  status: number;
}
