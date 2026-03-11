import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { formatError } from '../helper/error.helper';
import { OrgLoginDto } from 'src/auth/dto/org-login.dto';

@Injectable()
export class AuthLocalOrgGuard extends AuthGuard('org') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const object = plainToInstance(OrgLoginDto, request.body);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(formatError(errors));
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
