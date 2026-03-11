import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/common/entities/notification.entity';
import { Repository } from 'typeorm';
import { AddNotificationEvent } from './events/notification.event';
import { NotificationDelivery } from 'src/common/entities/notificationDelivery.entity';
import {
  NotificationDeliveryStatus,
  NotificationDeliveryStatusEnum,
  NotificationDeliveryStatusValueEnum,
} from 'src/common/entities/notificationDeliveryStatus.entity';
import { User } from 'src/common/entities/user.entity';
import {
  DeliveryTypeEnum,
  DeliveryTypeValueEnum,
} from 'src/common/entities/deliveryType.entity';
import { EmailService } from 'src/email/email.service';
import { SMSService } from 'src/sms/sms.service';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import * as admin from 'firebase-admin';
import { PermissionException } from 'src/common/exceptions/permission.exception';
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationDelivery)
    private notificationDeliveryRepository: Repository<NotificationDelivery>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
  ) {
    const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_DETAILS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async list(user: DefaultUserResponse, queryParams: NotificationQueryDto) {
    let listQuery = this.notificationRepository.createQueryBuilder('notification');
    listQuery
      .innerJoin('notification.notificationDelivery', 'notificationDelivery')
      .where('notificationDelivery.deliveryType = :deliveryType')
      .andWhere('notification.userId = :userId')
      .setParameters({ userId: user.id, deliveryType: DeliveryTypeValueEnum.WebApp });

    listQuery = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: listQuery,
    });

    const unReadCountQuery = listQuery.clone();
    unReadCountQuery
      .andWhere('notification.isRead = :isRead')
      .setParameters({ isRead: 0 });

    const unReadCount = await unReadCountQuery.getCount();

    const [notifications, count] = await listQuery.getManyAndCount();

    return { notifications, count, unReadCount };
  }

  async create(data: AddNotificationEvent) {
    let notification = this.notificationRepository.create(data);
    notification = await this.notificationRepository.save(notification);
    for (const deliveryType of data.deliveryType) {
      let notificationDelivery = this.notificationDeliveryRepository.create({
        deliveryType,
        notification,
        status: new NotificationDeliveryStatus({ id: 1 }),
      });
      await this.notificationDeliveryRepository.save(notificationDelivery);
    }

    return notification;
  }

  async sendNotification(notificationId: number) {
    let notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: {
        notificationDelivery: true,
      },
    });

    return await this.handleNotification(
      notification.notificationDelivery,
      notification.data,
      notification.userId,
    );
  }

  async handleNotification(
    notificationDeliveryArr: NotificationDelivery[],
    data: any,
    userId: number,
  ) {
    for (const notificationDelivery of notificationDeliveryArr) {
      try {
        switch (notificationDelivery.deliveryTypeId) {
          case DeliveryTypeValueEnum.Email:
            await this.emailService.sendEmail(data as any);
            break;
          case DeliveryTypeValueEnum.SMS:
            await this.smsService.sendSMS(data.message, data.mobile);
            break;
          case DeliveryTypeValueEnum.WebApp:
            await this.sendFcmWebNotification(data, userId);
            break;
          case DeliveryTypeValueEnum.MobileApp:
            await this.sendFcmMobileNotification(data, userId);
            break;
        }
        notificationDelivery.statusId = NotificationDeliveryStatusValueEnum.Success;
        notificationDelivery.deliverTime = new Date();
        await this.notificationDeliveryRepository.save(notificationDelivery);
      } catch (error) {
        notificationDelivery.statusId = NotificationDeliveryStatusValueEnum.Failed;
        await this.notificationDeliveryRepository.save(notificationDelivery);
        throw error;
      }
    }
  }

  async sendFcmWebNotification(data: any, userId: number) {
    try {
      let user = await this.userRepository.findOne({
        where: { id: userId },
      });

      const webRegistrationToken = user.fcmWebToken;

      if (webRegistrationToken) {
        const message: TokenMessage = {
          data: {
            title: data.title,
            body: data.body,
          },
          token: webRegistrationToken,
        };
        await admin.messaging().send(message);
      }
    } catch (error) {
      throw error;
    }
  }

  async sendFcmMobileNotification(data: any, userId: number) {
    try {
      let user = await this.userRepository.findOne({
        where: { id: userId },
      });

      const androidRegistrationToken = user.fcmAndroidToken;
      const iOSRegistrationToken = user.fcmIosToken;

      if (androidRegistrationToken) {
        const message: TokenMessage = {
          data: {
            title: data.title,
            body: data.body,
          },
          token: androidRegistrationToken,
          android: {
            priority: 'high',
          },
        };

        await admin.messaging().send(message);
      }

      if (iOSRegistrationToken) {
        const message: TokenMessage = {
          data: {
            title: data.title,
            body: data.body,
          },
          token: iOSRegistrationToken,
        };

        await admin.messaging().send(message);
      }
    } catch (error) {
      throw error;
    }
  }

  async find(notificationId: number): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id: notificationId } });
  }

  async readNotification(
    user: any,
    notificationId: number,
    readNotificationDto: ReadNotificationDto,
  ) {
    const notification = await this.find(notificationId);
    if (!notification) {
      throw new NotFoundException();
    }
    if (notification.userId != user.id) {
      throw new PermissionException();
    }

    notification.isRead = readNotificationDto.read as number;

    await this.notificationRepository.save(notification);
  }

  async readAllNotification(user: DefaultUserResponse) {
    await this.notificationRepository.update({ userId: user.id }, { isRead: 1 });
    return;
  }
}
