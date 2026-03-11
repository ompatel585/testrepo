import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrmDownload } from 'src/common/entities/drmDownload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DrmDownload])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
