import { Module } from '@nestjs/common';
import { DrmService } from './drm.service';
import { DrmController } from './drm.controller';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drm } from 'src/common/entities/drm.entity';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';
import { DrmDownload } from 'src/common/entities/drmDownload.entity';
import { DrmDownloadController } from './drm-download.controller';

@Module({
  imports: [
    FileUploadModule,
    TypeOrmModule.forFeature([Drm, DrmDownload]),
    CloudLoggerModule,
  ],
  controllers: [DrmController, DrmDownloadController],
  providers: [DrmService],
  exports: [DrmService],
})
export class DrmModule {}
