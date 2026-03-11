import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AuthJwtGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (!user) {
      if (err) {
        this.logger.error(err.message);
      }
      if (info) {
        this.logger.verbose(info.message);
        if (info.message === 'invalid signature') {
          throw new UnauthorizedException('Invalid Access Token');
        } else if (info.message === 'jwt expired') {
          throw new UnauthorizedException('Token has expired!');
        } else if (info.message === 'session expired') {
          throw new UnauthorizedException('Session Expired');
        } else {
          throw new UnauthorizedException();
        }
      }
      throw new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
