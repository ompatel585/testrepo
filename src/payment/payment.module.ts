import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
import { PaymentGateway } from 'src/common/entities/payment-gateway.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/common/entities/payment.entity';
import { User } from 'src/common/entities/user.entity';
import { PaymentOptionPaymentGatewayMapping } from 'src/common/entities/paymentOptionPaymentGatewayMapping.entity';
import { PaymentGatewayBrandMapping } from 'src/common/entities/payment-gateway-brand-mapping.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';
import { PaymentOption } from 'src/common/entities/paymentOption.entity';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { MasterModule } from 'src/master/master.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentReceiptService } from './payment-receipt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentGateway,
      Payment,
      User,
      PaymentOptionPaymentGatewayMapping,
      PaymentGatewayBrandMapping,
      PaymentOption,
      UserMetaData,
    ]),
    ProfileModule,
    CloudLoggerModule,
    MasterModule,
    UsersModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, CryptoServiceUtil, PaymentReceiptService],
  exports: [PaymentService],
})
export class PaymentModule {}
