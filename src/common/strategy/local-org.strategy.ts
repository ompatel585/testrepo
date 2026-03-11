import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class LocalOrgStrategy extends PassportStrategy(Strategy, 'org') {
  constructor(private authService: AuthService) {
    super({
      // override default usernameField username to userId
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateOrg(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
