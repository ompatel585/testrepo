// s3-multipart.controller.ts
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { S3MultipartService } from './s3-multipart.service';
import { Public } from 'src/common/decorator/public.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { PresignedPartDto } from './dto/presigned-part.dto';
import { CompleteMultipartUploadDto } from './dto/complete-multipart-upload.dto';
import { AbortMultipartUploadDto } from './dto/abort-multipart-upload.dto';

@Controller('s3-multipart')
export class S3MultipartController {
  constructor(private readonly s3MultipartService: S3MultipartService) {}

  @Post('presigned-part')
  async getPresignedUrl(@Body(new ValidationPipe()) presignedPartDto: PresignedPartDto) {
    try {
      const { filePath, uploadId, partNumber } = presignedPartDto;
      const preSignedUrlData = await this.s3MultipartService.generatePresignedUrlForPart(
        filePath,
        uploadId,
        Number(partNumber),
      );

      return new ResponseHelper(preSignedUrlData);
    } catch (error) {
      console.log('S3MultipartController->getPresignedUrl', error);
      throw error;
    }
  }

  @Post('complete')
  async completeUpload(
    @Body(new ValidationPipe()) completeMultipartUploadDto: CompleteMultipartUploadDto,
  ) {
    try {
      const { filePath, uploadId, parts } = completeMultipartUploadDto;
      const result = await this.s3MultipartService.completeMultipartUpload(
        filePath,
        uploadId,
        parts,
      );

      return new ResponseHelper({ message: 'Upload complete', result });
    } catch (error) {
      console.log('S3MultipartController->completeUpload', error);
      throw error;
    }
  }

  @Post('abort')
  async abortUpload(
    @Body(new ValidationPipe()) abortMultipartUploadDto: AbortMultipartUploadDto,
  ) {
    try {
      const { filePath, uploadId } = abortMultipartUploadDto;
      await this.s3MultipartService.abortMultipartUpload(filePath, uploadId);

      return new ResponseHelper({ message: 'Upload aborted' });
    } catch (error) {
      console.log('S3MultipartController->abortUpload', error);
      throw error;
    }
  }
}
