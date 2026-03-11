import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';

export enum TaxonomyBrandSortBY {
  ID = 'id',
}

export class TaxonomyBrandFilterDto {
  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  brandId: number[];
}

export class TaxonomyBrandQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => TaxonomyBrandFilterDto)
  filter: TaxonomyBrandFilterDto;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsIn([0, 1])
  filterForModerator: number;

  @IsOptional()
  @IsEnum(TaxonomyBrandSortBY)
  sortBy: TaxonomyBrandSortBY = TaxonomyBrandSortBY.ID;
}
