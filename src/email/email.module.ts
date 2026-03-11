import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';

@Module({
  imports: [CloudLoggerModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
