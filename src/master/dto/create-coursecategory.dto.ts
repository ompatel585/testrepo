import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';

export class CreateCourseCategoryDto {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'event_course_category', column: 'categoryName' })
  categoryName: string;

  @IsNotEmpty()
  @IsNumber()
  @IsExist({ tableName: 'event', column: 'id' })
  eventId: number;

  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'event_course_category', column: 'courseCode' })
  courseCode: string;
}
