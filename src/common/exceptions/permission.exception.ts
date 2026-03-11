import { HttpException, HttpStatus } from '@nestjs/common';

export enum PermissionErrorMessagesEnum {
  ACCESS_DENIED = 'Access Denied',
  INSUFFICIENT_ROLE = 'Insufficient Role',
}

export class PermissionException extends HttpException {
  constructor(
    message:
      | PermissionErrorMessagesEnum
      | string = PermissionErrorMessagesEnum.ACCESS_DENIED,
  ) {
    super({ statusCode: HttpStatus.FORBIDDEN, message }, HttpStatus.FORBIDDEN);
  }
}
