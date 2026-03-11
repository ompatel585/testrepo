import {
  DeliveryType,
  DeliveryTypeValueEnum,
} from 'src/common/entities/deliveryType.entity';
import {
  NotificationType,
  NotificationTypeValueEnum,
} from 'src/common/entities/notificationType.entity';
import { User } from 'src/common/entities/user.entity';

export const AddNotification = 'notification.add';
export const SendNotification = 'notification.send';

export class AddNotificationEvent {
  type;
  data;
  deliveryType = [];
  user;

  constructor(payload: {
    type: NotificationTypeValueEnum;
    data: object;
    deliveryType: DeliveryTypeValueEnum[];
    user: number;
  }) {
    this.type = new NotificationType({ id: payload.type });
    this.data = payload.data;
    for (const deliveryTypeId of payload.deliveryType) {
      this.deliveryType.push(new DeliveryType({ id: deliveryTypeId }));
    }
    this.user = new User({ id: payload.user });
  }
}

export class SendNotificationEvent {
  notificationId;

  constructor(payload: { notificationId: number }) {
    this.notificationId = payload.notificationId;
  }
}
