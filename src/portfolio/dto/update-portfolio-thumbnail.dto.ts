import { PickType } from '@nestjs/mapped-types';
import { CreatePortfolioDto } from './create-portfolio.dto';

export class UpdatePortfolioThumbnailDto extends PickType(CreatePortfolioDto, [
  'thumbnail',
]) {}
