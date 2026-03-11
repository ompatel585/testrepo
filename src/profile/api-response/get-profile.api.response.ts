import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/common/entities/user.entity';

class Data {
  @ApiProperty({ type: User })
  item: User;
}

export class ApiResponseDTO {
  @ApiProperty({ type: Data })
  data: Data;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  errors: any[];

  @ApiProperty()
  statusCode: number;
}
