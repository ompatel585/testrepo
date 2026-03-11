import { Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsInt, ValidateNested } from 'class-validator';

export class UpdateBookSubBrandItemDto {
  @IsInt()
  aptrack_book_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  subBrandKeys: number[];
}

export class UpdateBookSubBrandDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBookSubBrandItemDto)
  bookSubBrandData: UpdateBookSubBrandItemDto[];
}
