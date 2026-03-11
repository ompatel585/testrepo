import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super({ statusCode: HttpStatus.FORBIDDEN, message }, HttpStatus.FORBIDDEN);
  }
}
