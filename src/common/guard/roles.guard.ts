import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Role } from '../enum/role.enum';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from '../exceptions/permission.exception';
import { UserResponse } from '../strategy/jwt.strategy';
import { BRANDS_KEY } from '../decorator/brands.decorator';
import { ROLE_BRAND_KEY, RoleBrand } from '../decorator/role-brand.decorator';
import { isDefaultUser } from '../decorator/default-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserResponse;
    const token = this.extractTokenFromHeader(request);

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredBrands = this.reflector.getAllAndOverride<number[]>(BRANDS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoleBrands = this.reflector.getAllAndOverride<RoleBrand[]>(
      ROLE_BRAND_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      !requiredRoles?.length &&
      !requiredBrands?.length &&
      !requiredRoleBrands?.length
    ) {
      return true;
    }

    if (isDefaultUser(user)) {
      if (requiredRoleBrands?.length) {
        const match = requiredRoleBrands.some(
          (rb) =>
            rb.role === user.activeRole.role && rb.brandId === user.activeRole.brandId,
        );

        if (!match) {
          throw new PermissionException(PermissionErrorMessagesEnum.INSUFFICIENT_ROLE);
        }
      }

      if (requiredRoles?.length) {
        const match = requiredRoles.includes(user.activeRole.role);

        if (!match) {
          throw new PermissionException(PermissionErrorMessagesEnum.INSUFFICIENT_ROLE);
        }
      }

      if (requiredBrands?.length) {
        const match = requiredBrands.includes(user.activeRole.brandId);

        if (!match) {
          throw new PermissionException(PermissionErrorMessagesEnum.INSUFFICIENT_ROLE);
        }
      }
    }

    if (user.userType == 'service' || user.userType == 'org') {
      if (!requiredRoles.includes(user.role)) {
        throw new PermissionException(PermissionErrorMessagesEnum.INSUFFICIENT_ROLE);
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    // Authorization: Bearer <token>
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
