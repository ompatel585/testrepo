import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../enum/role.enum';
import { UserAccessValidationService } from 'src/users/user-access-validation.service';
import { RoleBrand } from '../decorator/role-brand.decorator';
import { User_Type } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
import { UsersService } from 'src/users/users.service';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { getUserActiveRoleRedisKey } from 'src/cache/redis-keys';

export interface BaseUserResponse {
  userType: 'org' | 'service' | null | User_Type;
}
export interface OrgUserResponse extends BaseUserResponse {
  id: number;
  name: string;
  email: string;
  role: Role.Org;
  userType: 'org';
}

export interface ServiceUserResponse extends BaseUserResponse {
  id: number;
  name: string;
  role: Role.Service;
  userType: 'service';
}

export interface DefaultUserResponse extends BaseUserResponse {
  id: number;
  userId: string;
  fetchMetadata: boolean;
  jti?: string;
  userType: null | User_Type;
  activeRole: null | UserRole;
}

export type UserResponse = OrgUserResponse | ServiceUserResponse | DefaultUserResponse;
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
  constructor(
    private readonly accessValidation: UserAccessValidationService,
    private readonly usersService: UsersService,
    private readonly redisCache: RedisCacheService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtConfig').JWT_STRATEGY_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any, done: Function): Promise<UserResponse> {
    const token = this.extractor(req);

    if (!token) {
      return done(null, false, { message: 'No token found in request' });
    }

    let activeRole: UserRole = null;
    // Redis
    if (this.redisCache.isConnected()) {
      const redisTTL = this.configService.get('jwtConfig').JWT_ACCESS_TOKEN_EXPIRES_IN;
      const userActiveRoleKey = getUserActiveRoleRedisKey(payload.id);

      activeRole = (await this.redisCache.get(userActiveRoleKey)) as UserRole;

      if (!activeRole) {
        activeRole = await this.usersService.getSelectedRole(payload.id);
        await this.redisCache.set(userActiveRoleKey, activeRole, redisTTL);
      }
    } else {
      activeRole = await this.usersService.getSelectedRole(payload.id);
    }

    if (payload.role === Role.Service) {
      const isValidAccessToken = await this.accessValidation.isServiceTokenValid(
        payload.id,
        token,
      );

      if (!isValidAccessToken) {
        return done(null, false, { message: 'session expired' });
      }
    } else if (
      ![Role.Org, Role.DigitalAuditor, Role.Student].includes(
        payload?.role || activeRole?.role,
      )
    ) {
      // extract the jti from token
      const isValidAccessToken = await this.accessValidation.isUserTokenValid(
        payload.id,
        payload.jti,
      );

      if (!isValidAccessToken) {
        return done(null, false, { message: 'session expired' });
      }
    }

    if (payload.role == Role.Org) {
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        userType: 'org',
      };
    }

    if (payload.role == Role.Service) {
      return {
        id: payload.id,
        name: payload.name,
        role: payload.role,
        userType: 'service',
      };
    }

    return {
      id: payload.id,
      userId: payload.userId,
      fetchMetadata: payload.fetchMetadata,
      jti: payload.jti,
      userType: payload.userType,
      activeRole: activeRole,
    };
  }
}
