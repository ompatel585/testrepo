import { Module } from '@nestjs/common';
import { SMSService } from './sms.service';

@Module({
  imports: [],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
