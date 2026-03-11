import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthJwtRefreshTokenGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger(AuthJwtRefreshTokenGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
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
