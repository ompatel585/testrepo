import { Module } from '@nestjs/common';
import { CloudLoggerService } from './cloud-logger.service';

@Module({
  providers: [CloudLoggerService],
  exports: [CloudLoggerService],
})
export class CloudLoggerModule {}
