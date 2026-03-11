import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateStudentMetaDataDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;
}
