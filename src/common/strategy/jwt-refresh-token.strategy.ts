import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../enum/role.enum';
import { UserAccessValidationService } from 'src/users/user-access-validation.service';
import { Request } from 'express';
import { DefaultUserResponse } from './jwt.strategy';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly accessValidation: UserAccessValidationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.refreshToken;
          return token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtConfig').JWT_STRATEGY_REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: any,
    done: Function,
  ): Promise<DefaultUserResponse> {
    if ([Role.Service, Role.Org].includes(payload.role)) {
      throw new UnauthorizedException();
    }
    if (![Role.DigitalAuditor].includes(payload.role)) {
      const isValidRefreshToken = await this.accessValidation.isRefreshTokenValid(
        payload.id,
        payload.jti,
      );
      if (!isValidRefreshToken) {
        return done(null, false, { message: 'session expired' });
      }
    }

    return {
      id: payload.id,
      userId: payload.userId,
      fetchMetadata: payload.fetchMetadata,
      jti: payload.jti,
      userType: payload.userType,
      activeRole: null,
    };
  }
}
