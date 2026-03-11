import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/common/entities/notification.entity';
import { NotificationListener } from './listeners/notification.listener';
import { NotificationDelivery } from 'src/common/entities/notificationDelivery.entity';
import { EmailModule } from 'src/email/email.module';
import { SMSModule } from 'src/sms/sms.module';
import { User } from 'src/common/entities/user.entity';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification, NotificationDelivery]),
    EmailModule,
    SMSModule,
    CloudLoggerModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationListener],
})
export class NotificationModule {}
