import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';

export class AddBookDto {
  @IsNumber()
  @IsAlreadyExist({ tableName: 'course_module', column: 'aptrack_1_book_id' })
  aptrack_1_book_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  brandKey: number;

  @IsOptional()
  @IsNumber()
  subBrandKey: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}
