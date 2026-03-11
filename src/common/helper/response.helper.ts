import { ApiProperty } from '@nestjs/swagger';
import { ResponseInterface } from '../interceptor/responseMapping.interceptor';
import { Type } from '@nestjs/common';

export class ResponseHelper<T> implements ResponseInterface<T> {
  data: T;
  count?: number;
  restParams: {};

  constructor(data: T, count = 0, restParams = {}) {
    this.data = data;
    this.count = count;
    this.restParams = restParams;
  }
}

function createDataDTO<T>(itemType: Type<T>): any {
  class DataDTO {
    @ApiProperty({ type: itemType })
    item: T;
  }
  return DataDTO;
}

export function createApiResponseDTO<T>(itemType: Type<T>): any {
  class ResponseData {
    @ApiProperty({ type: createDataDTO(itemType) })
    data: any;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'ok' })
    message: string;

    // @ApiProperty()
    // errors: any[];

    @ApiProperty({ example: 200 })
    statusCode: number;
  }
  return ResponseData;
}
