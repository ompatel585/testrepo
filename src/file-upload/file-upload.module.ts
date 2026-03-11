import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { CustomCacheModule } from 'src/cache/custom-cache.module';
import { S3MultipartService } from './s3-multipart.service';
import { S3MultipartController } from './s3-multipart.controller';

@Module({
  imports: [CustomCacheModule],
  providers: [FileUploadService, S3MultipartService],
  controllers: [FileUploadController, S3MultipartController],
  exports: [FileUploadService, S3MultipartService],
})
export class FileUploadModule {}
