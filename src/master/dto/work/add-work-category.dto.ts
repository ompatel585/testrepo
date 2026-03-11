import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';
import { IsExist } from 'src/common/validation/isExists';

export class AddWorkCategoryDto {
  @IsNotEmpty()
  @IsExist({ tableName: 'brand', column: 'id' })
  @IsNumber()
  brandId: number;

  @IsString()
  @IsNotEmpty()
  @IsAlreadyExist((obj) => ({
    tableName: 'work_category',
    column: 'name',
    where: [{ brandId: obj.brandId }],
  }))
  name: string;
}
