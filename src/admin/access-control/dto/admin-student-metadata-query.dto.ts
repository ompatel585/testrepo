import { IsNotEmpty, IsString } from 'class-validator';

export class AdminStudentMetaDataQueryDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;
}
