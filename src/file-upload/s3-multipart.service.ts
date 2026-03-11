// s3-multipart.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  CompletedPart,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3MultipartService {
  private readonly s3: S3Client;
  private bucketName = process.env.S3_BUCKET_NAME;
  private readonly logger = new Logger(S3MultipartService.name);

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client(this.configService.get('serverConfig').S3_CREDENTIALS);
  }

  async initiateMultipartUpload(filePath: string, contentType: string) {
    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: filePath,
        ContentType: contentType,
      });

      const response = await this.s3.send(command);
      return response.UploadId;
    } catch (error) {
      this.logger.error('Error initiating multipart upload:', error);
      throw error;
    }
  }

  async generatePresignedUrlForPart(
    filePath: string,
    uploadId: string,
    partNumber: number,
    expiresInSeconds = 3600,
  ): Promise<{ url: string; filePath: string }> {
    try {
      const command = new UploadPartCommand({
        Bucket: this.bucketName,
        Key: filePath,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      const preSignedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: expiresInSeconds,
      });
      return { url: preSignedUrl, filePath: filePath };
    } catch (error) {
      this.logger.error('Error generating pre-signed URL:', error);
      throw error;
    }
  }

  async completeMultipartUpload(
    filePath: string,
    uploadId: string,
    parts: CompletedPart[],
  ) {
    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: filePath,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });

      return await this.s3.send(command);
    } catch (error) {
      this.logger.error('Error completing multipart upload:', error);

      const clientErrors = new Set(['NoSuchUpload', 'InvalidPart', 'InvalidPartOrder']);

      if (clientErrors.has(error.name)) {
        throw new BadRequestException('Could not upload file. Please try again.');
      }
      throw error;
    }
  }

  async abortMultipartUpload(filePath: string, uploadId: string) {
    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: filePath,
        UploadId: uploadId,
      });

      return await this.s3.send(command);
    } catch (error) {
      this.logger.error('Error aborting multipart upload:', error);
      if (error.name === 'NoSuchUpload') {
        throw new BadRequestException('Could not upload file. Please try again.');
      }
      throw error;
    }
  }
}
