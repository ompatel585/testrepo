import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DefaultUserResponse, UserResponse } from '../strategy/jwt.strategy';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from '../exceptions/permission.exception';
import { User_Type } from '../entities/user.entity';

export function isDefaultUser(user: UserResponse): user is DefaultUserResponse {
  if (
    user.userType == null ||
    Object.values(User_Type).includes(user.userType as User_Type)
  ) {
    return true;
  }
  return false;
}

export const DefaultUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): DefaultUserResponse => {
    const request = ctx.switchToHttp().getRequest();
    if (!isDefaultUser(request.user)) {
      throw new PermissionException(PermissionErrorMessagesEnum.INSUFFICIENT_ROLE);
    }
    return request.user;
  },
);
