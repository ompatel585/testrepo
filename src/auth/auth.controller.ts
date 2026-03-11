import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  Patch,
  Logger,
  Res,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLocalGuard } from 'src/common/guard/auth-local.guard';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorator/public.decorator';
import { AuthLocalOrgGuard } from 'src/common/guard/auth-local-org.guard';
import { GuestRegisterDto } from './dto/guest-register.dto';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { AuthLocalGuestGuard } from 'src/common/guard/auth-local-guest.guard';
import { GuestGenerateOtp } from './dto/guest-generate-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordVerifyDto } from './dto/forgot-password-verify.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GuestSocialOAuthRegisterDto } from './dto/guest-social-oauth-register';
import { CookieOptions, Request, Response } from 'express';
import {
  GuestSocialOAuthAccessTokenDto,
  socialOAuthType,
} from './dto/guest-social-oauth-access-token';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ServiceLoginDto } from './dto/service-login.dto';
import { CaptchaDto } from './dto/captcha.dto';
import { UserActivityService } from 'src/user-activity/userActivity.service';
import { UserActivityMiddleware } from 'src/common/middleware/userActivity.middleware';
import { AuthJwtRefreshTokenGuard } from 'src/common/guard/auth-jwt-refresh-token.guard';
import { User } from 'src/common/entities/user.entity';
import { VerifyUserAndSendOTP } from './dto/verify-send-otp.dto';
import { VerifyUserAndUpdatePass } from './dto/verify-otp-update-password.dto';
import { AuthCredUpdateService } from './auth.cred-update.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { M365AuthService } from './m365-auth.service';
import * as constant from '../common/constants';
import { VerifyUserOTP } from './dto/verify-user-otp';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(UserActivityMiddleware.name);
  constructor(
    private authService: AuthService,
    private authCredUpdateService: AuthCredUpdateService,

    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly userActivityService: UserActivityService,

    private readonly m365AuthService: M365AuthService,
  ) {}

  @Public()
  @UseGuards(AuthLocalOrgGuard)
  @Post('org/login')
  async loginOrg(@Req() req: Request) {
    try {
      return await this.authService.orgLogin(req.user);
    } catch (error) {
      console.log('loginOrg', error);
      throw error;
    }
  }

  @Public()
  @UseGuards(AuthLocalGuard)
  @Post('login')
  async login(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const { refreshToken, ...loginTokenData } = await this.authService.login(req.user);

      // token for cdn asset access
      res.cookie('token', loginTokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge: this.configService.get('jwtConfig').COOKIE_EXPIRES_IN_MILLISECOND,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      // refreshToken to get new access-token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge:
          this.configService.get('jwtConfig').REFRESH_TOKEN_COOKIE_EXPIRES_IN_MILLISECOND,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      try {
        await this.userActivityService.trackActivity(req, req.user.id, 'loggedIn');
      } catch (error) {
        this.logger.warn(`Failed to track login activity: ${error.message}`);
        console.error('Activity tracking failed during login:', error.message);
      }
      return loginTokenData;
    } catch (error) {
      console.log('login', error);
      throw error;
    }
  }

  @Public()
  @Post('guest/gen-otp')
  async guestGenerateOtp(
    @Body(new ValidationPipe()) guestGenerateOtpDto: GuestGenerateOtp,
  ) {
    try {
      return await this.authService.guestGenerateOtp(guestGenerateOtpDto);
    } catch (error) {
      console.log('guestGenerateOtp', error);
      throw error;
    }
  }

  @Public()
  @Post('guest/register')
  async guestRegister(@Body(new ValidationPipe()) guestRegisterDto: GuestRegisterDto) {
    try {
      return await this.authService.guestRegister(guestRegisterDto);
    } catch (error) {
      console.log('guestRegister', error);
      throw error;
    }
  }

  @Public()
  @UseGuards(AuthLocalGuestGuard)
  @Post('guest/login')
  async guestLogin(@Req() req: Request) {
    try {
      return await this.authService.login(req.user as User);
    } catch (error) {
      console.log('guestLogin', error);
      throw error;
    }
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'generate otp for forgot password' })
  @ApiResponse({
    status: 201,
    description: 'OTP generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP generated successfully' },
        otpToken: { type: 'string', example: 'abc123' },
      },
    },
  })
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{
    message: string;
    otpToken: string;
  }> {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto);
    } catch (error) {
      console.log('forgotPassword', error);
      throw error;
    }
  }

  @Public()
  @Post('forgot-password-otp-verify')
  async forgotPasswordOtpVerify(
    @Body(new ValidationPipe())
    forgotPasswordVerifyDto: ForgotPasswordVerifyDto,
  ) {
    try {
      return await this.authService.forgotPasswordOtpVerify(forgotPasswordVerifyDto);
    } catch (error) {
      console.log('forgotPasswordOtpVerify', error);
      throw error;
    }
  }

  @Public()
  @Post('update-password')
  async updatePassword(@Body(new ValidationPipe()) updatePasswordDto: UpdatePasswordDto) {
    try {
      return await this.authService.updatePassword(updatePasswordDto);
    } catch (error) {
      console.log('updatePassword', error);
      throw error;
    }
  }

  @Public()
  @Post('social-guest-register')
  async guestRegisterViaSocialOAuth(
    @Body(new ValidationPipe())
    GuestSocialOAuthAccessTokenDto: GuestSocialOAuthAccessTokenDto,
  ) {
    /* try {
      let userData: GuestSocialOAuthRegisterDto;
      if (GuestSocialOAuthAccessTokenDto.type === socialOAuthType.Google) {
        userData = await this.authService.fetchUserDetailsFromGoogle(
          GuestSocialOAuthAccessTokenDto.accessToken,
        );
      }
      if (GuestSocialOAuthAccessTokenDto.type === socialOAuthType.Facebook) {
        userData = await this.authService.fetchUserDetailsFromFacebook(
          GuestSocialOAuthAccessTokenDto.accessToken,
        );
      }
      const user = await this.authService.guestRegisterViaSocialOAuth(userData);
      const accessToken = this.authService.login(user);
      return accessToken;
    } catch (error) {
      console.log('guestRegisterViaSocialOAuth', error);
      throw error;
    } */
  }

  @Public()
  @Patch('reset-password')
  async resetPassword(@Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      return new ResponseHelper('success');
    } catch (error) {
      console.log('in error of reset-password: ' + error);
      throw error;
    }
  }

  @Public()
  @Post('service/login')
  async serviceLogin(@Body() serviceLogin: ServiceLoginDto) {
    try {
      return new ResponseHelper(await this.authService.serviceLogin(serviceLogin));
    } catch (error) {
      console.log('error in AuthController->serviceLogin');
      throw error;
    }
  }

  @Public()
  @Post('verify-captcha')
  async verifyCaptcha(@Body() captchaData: CaptchaDto) {
    try {
      return await this.authService.verifyCaptcha(captchaData.captcha);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @UseGuards(AuthJwtRefreshTokenGuard)
  @Get('refresh-token')
  async refreshAccessToken(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const payload = req.user;
      const accessToken = this.jwtService.sign(payload);

      // new access-token for cdn asset access
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge: this.configService.get('jwtConfig').COOKIE_EXPIRES_IN_MILLISECOND,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      // runs in background
      // fetch user (student/faculty) metadata and update
      this.authService.updateUserMetaDataOnRefreshToken(req.user);
      return {
        access_token: accessToken,
        roles: payload.roles,
      };
    } catch (error) {
      console.log('refreshAccessToken', error);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  async logoutUser(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge: 0,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      };

      res.clearCookie('token', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.log('refreshAccessToken', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Post('verify-user-send-otp')
  async verifyUserAndSendOTP(
    @Body(new ValidationPipe()) verifyUserAndSendOTP: VerifyUserAndSendOTP,
  ) {
    try {
      return await this.authCredUpdateService.verifyUserAndSendOTP(verifyUserAndSendOTP);
    } catch (error) {
      console.log('AuthController:verifyUserAndSendOTP: ' + error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Post('verify-otp-update-pass')
  async VerifyUserAndUpdateUserPass(
    @Body(new ValidationPipe()) verifyUserAndUpdatePass: VerifyUserAndUpdatePass,
  ) {
    try {
      return await this.authCredUpdateService.verifyUserAndUpdateUserPass(
        verifyUserAndUpdatePass,
      );
    } catch (error) {
      console.log('AuthController:VerifyUserAndUpdateUserPass: ' + error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Post('verify-user-otp')
  async VerifyUserOTP(@Body(new ValidationPipe()) verifyUserOTP: VerifyUserOTP) {
    try {
      return await this.authCredUpdateService.verifyUserOTP(verifyUserOTP);
    } catch (error) {
      console.log('AuthController:VerifyUserOTP: ' + error);
      throw error;
    }
  }

  @Public()
  @Get('m365/login')
  async m365Login(@Res() res: Response) {
    const url = await this.m365AuthService.getLoginUrl();
    return res.redirect(url);
  }

  @Public()
  @Get('m365/callback')
  async m365Callback(@Query('code') code: string, @Res() res: Response) {
    try {
      // Microsoft access token
      const accessToken = await this.m365AuthService.getTokenFromCode(code);

      const profile = await this.m365AuthService.getUserProfile(accessToken);

      const email = profile.mail || profile.userPrincipalName;

      if (!email) throw new UnauthorizedException('Microsoft profile missing!');

      // signed JWT to carry email (TTL 120s)
      const m365Token = this.jwtService.sign({ email }, { expiresIn: '120s' });

      // Cookie A → HttpOnly JWT
      res.cookie('m365AuthKey', m365Token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge: 2 * constant.ONE_MINUTE_IN_MILL_SEC,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      // Cookie B → Frontend detection cookie
      res.cookie('m365Ready', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge: 2 * constant.ONE_MINUTE_IN_MILL_SEC,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      // Redirect to login page
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    } catch (error) {
      console.error('M365 callback error:', error);
      throw error;
    }
  }

  private clearM365Cookies(res: Response) {
    res.clearCookie('m365AuthKey', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'local',
      sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
      ...(process.env.NODE_ENV !== 'local'
        ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
        : {}),
    });

    res.clearCookie('m365Ready', {
      httpOnly: false,
      secure: process.env.NODE_ENV !== 'local',
      sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
      ...(process.env.NODE_ENV !== 'local'
        ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
        : {}),
    });
  }

  @Public()
  @Get('m365/validate')
  async validateM365(@Req() req, @Res({ passthrough: true }) res: Response) {
    try {
      const signedToken = req.cookies?.m365AuthKey;
      if (!signedToken) throw new UnauthorizedException('Missing M365 session');

      let decoded: any;
      try {
        decoded = this.jwtService.verify(signedToken);
      } catch (err) {
        throw new UnauthorizedException('M365 session expired or invalid');
      }

      const email = decoded.email;
      const userId = email.split('@')[0];

      const user = await this.authService.validateUser(userId, '', false);

      // Clear temporary cookies
      this.clearM365Cookies(res);
      const { refreshToken, ...jwtTokens } = await this.authService.login(user);

      res.cookie('token', jwtTokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge: this.configService.get('jwtConfig').COOKIE_EXPIRES_IN_MILLISECOND,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'local',
        sameSite: process.env.NODE_ENV !== 'local' ? 'none' : 'lax',
        maxAge:
          this.configService.get('jwtConfig').REFRESH_TOKEN_COOKIE_EXPIRES_IN_MILLISECOND,
        ...(process.env.NODE_ENV !== 'local'
          ? { domain: this.configService.get('jwtConfig').COOKIE_DOMAIN }
          : {}),
      });

      try {
        await this.userActivityService.trackActivity(req, user.id, 'loggedIn');
      } catch (error) {
        this.logger.warn(`Failed to track login activity: ${error.message}`);
        console.error('Activity tracking failed during login:', error.message);
      }
      return jwtTokens;
    } catch (error) {
      this.clearM365Cookies(res);
      console.error('M365 validate error:', error);
      throw error;
    }
  }
}
