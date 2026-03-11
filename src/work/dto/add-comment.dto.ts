import { IsNotEmpty } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';

export class AddCommentDto {
  @IsNotEmpty()
  @IsExist({ tableName: 'master_work_comment', column: 'id' })
  masterWorkCommentId: number;
}
