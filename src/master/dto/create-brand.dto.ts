import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';
export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'brand', column: 'name' })
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  key: number;

  @IsOptional()
  @IsString()
  icon?: string;
}
