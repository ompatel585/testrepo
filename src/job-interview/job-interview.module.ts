import { Module } from '@nestjs/common';
import { JobInterviewService } from './job-interview.service';
import { JobInterviewController } from './job-interview.controller';
import { JobInterview } from 'src/common/entities/jobInterview.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([JobInterview])],
  controllers: [JobInterviewController],
  providers: [JobInterviewService],
  exports: [JobInterviewService],
})
export class JobInterviewModule {}
