import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';

export class EditWorkCategory {
  @IsNotEmpty()
  @IsExist({ tableName: 'brand', column: 'id' })
  @IsNumber()
  brandId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
