import { Controller, Body, Req, Patch } from '@nestjs/common';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { AuthV2Service } from './auth.v2.service';
import { ResetPasswordV2dDto } from './dto-v2/reset-password.v2.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@ApiTags('v2/auth')
@Controller('v2/auth')
export class AuthV2Controller {
  constructor(private authV2Service: AuthV2Service) {}

  @Patch('reset-password')
  async resetPassword(
    @Body(new ValidationPipe()) resetPasswordV2Dto: ResetPasswordV2dDto,
    @DefaultUser() user: DefaultUserResponse,
  ) {
    try {
      const userId = user.userId;
      await this.authV2Service.resetPassword(userId, resetPasswordV2Dto);
      return new ResponseHelper('success');
    } catch (error) {
      console.log('in error of reset-password: ' + error);
      throw error;
    }
  }
}
