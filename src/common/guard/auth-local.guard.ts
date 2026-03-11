import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../../auth/dto/login.dto';
import { formatError } from '../helper/error.helper';

@Injectable()
export class AuthLocalGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const object = plainToInstance(LoginDto, request.body);
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
