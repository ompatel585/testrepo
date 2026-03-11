import { AddBookDto } from './add-book.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class UpdateBookDto extends PartialType(
  OmitType(AddBookDto, ['aptrack_1_book_id']),
) {}
