import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // override default usernameField username to userId
      usernameField: 'userId',
    });
  }

  async validate(userId: string, password: string) {
    const user = await this.authService.validateUser(userId, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
