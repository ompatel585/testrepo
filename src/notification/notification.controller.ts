import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';
import { read } from 'fs';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async notificationList(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: NotificationQueryDto,
  ) {
    try {
      const { notifications, count, unReadCount } = await this.notificationService.list(
        user,
        queryDto,
      );
      return new ResponseHelper(notifications, count, { unReadCount });
    } catch (error) {
      console.log('notificationList', error);
      throw error;
    }
  }

  @Patch(':id/read')
  async readNotification(
    @DefaultUser() user: DefaultUserResponse,
    @Body() readNotificationDto: ReadNotificationDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    notificationId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.notificationService.readNotification(
          user,
          notificationId,
          readNotificationDto,
        ),
      );
    } catch (error) {
      console.log('readNotification', error);
      throw error;
    }
  }

  @Post('/read/all')
  async readAllNotification(@DefaultUser() user: DefaultUserResponse) {
    try {
      return new ResponseHelper(await this.notificationService.readAllNotification(user));
    } catch (error) {
      console.log('readAllNotification', error);
      throw error;
    }
  }
}
