import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class LocalGuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(private authService: AuthService) {
    super({
      // override default usernameField username to userId
      usernameField: 'type',
      passReqToCallback: true,
    });
  }

  async validate(req: any, type: string, password: string): Promise<any> {
    const user = await this.authService.validateGuest(
      type,
      password,
      req.body.email,
      req.body.mobile,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
