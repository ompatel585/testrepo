import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_FIREWALL_KEY } from '../decorator/user-firewall.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { UserBlacklist } from '../entities/user-blacklist.entity';

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserBlacklist)
    private readonly UserBlacklistRepo: Repository<UserBlacklist>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldCheck = this.reflector.get<boolean>(
      USER_FIREWALL_KEY,
      context.getHandler(),
    );

    if (!shouldCheck) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.UserBlacklistRepo.findOne({
      where: { userId: payload.userId },
    });

    console.log('------------------', user);

    if (user) {
      throw new NotFoundException('Access restricted');
    }

    return true;
  }
}
