import { Module } from '@nestjs/common';
import { SqsConsumerService } from './sqs-consumer.service';
import { PaymentModule } from 'src/payment/payment.module';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';

@Module({
  imports: [PaymentModule, CloudLoggerModule],
  providers: [SqsConsumerService],
})
export class SqsModule {}
