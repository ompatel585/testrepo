import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';

export class certificateByNameDto {
  @IsNotEmpty()
  @Matches(/\.(pdf)$/i, {
    message: 'provide valid pdf fileName',
  })
  @IsString()
  certName: string;
}
