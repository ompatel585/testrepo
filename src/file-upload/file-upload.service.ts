import { Inject, Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost, PresignedPostOptions } from '@aws-sdk/s3-presigned-post';
import { FIFTY, ONE_MINUTE_IN_MILL_SEC } from 'src/common/constants';
import { CustomCacheService } from 'src/cache/custom-cache.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger('FileUploadService');
  private s3: S3;
  private bucketName = process.env.S3_BUCKET_NAME;
  private aptrack2BucketName = process.env.APTRACK_TWO_S3_BUCKET_NAME;
  private aptrack2CertBucketName = process.env.APTRACK_TWO_CERT_S3_BUCKET_NAME;
  private s3Client: S3Client;

  constructor(
    private readonly customCacheService: CustomCacheService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3(this.configService.get('serverConfig').S3_CREDENTIALS);

    this.s3Client = new S3Client(this.configService.get('serverConfig').S3_CREDENTIALS);
  }

  async generateGetObjectPresignedUrl(
    filePath: string,
    s3BucketName: string = this.bucketName,
    s3clientInstance?: S3Client,
  ): Promise<string> {
    if (!filePath) {
      this.logger.error('File path is required to generate a presigned URL.');
      return null;
    }

    try {
      let cachedPreSignedUrl = (await this.customCacheService.get(filePath)) as string;

      if (cachedPreSignedUrl !== undefined) {
        return cachedPreSignedUrl;
      }

      const headCommand = new HeadObjectCommand({
        Bucket: s3BucketName,
        Key: filePath,
      });
      /**
       * check for file exists or not
       */
      const newS3clientInstance = s3clientInstance ?? this.s3Client;
      /**
       * need to fix with aptrack2 S3-bucket currently failing!!!!
       */

      // await newS3clientInstance.send(headCommand);

      const command = new GetObjectCommand({
        Bucket: s3BucketName,
        Key: filePath,
      });

      const preSignedUrl = await getSignedUrl(newS3clientInstance, command, {
        expiresIn: 3600,
      });

      await this.customCacheService.set(
        filePath,
        preSignedUrl,
        ONE_MINUTE_IN_MILL_SEC * FIFTY,
      );
      return preSignedUrl;
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        await this.customCacheService.set(filePath, null, ONE_MINUTE_IN_MILL_SEC * FIFTY);
        this.logger.error(`File does not exist at ${filePath}`);
      } else {
        this.logger.error('Error generating presigned URL:', error);
      }
      return null;
    }
  }

  async generatePutObjectPresignedUrl(
    presignedURLKey: string,
  ): Promise<{ url: string; presignedURLKey: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: presignedURLKey,
    });

    try {
      const preSignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return { url: preSignedUrl, presignedURLKey: presignedURLKey };
    } catch (error) {
      this.logger.error('Error generating pre-signed URL:', error);
      throw error;
    }
  }

  async generatePostObjectPresignedUrl(
    presignedURLKey: string,
    contentLengthMax: number,
    contentLengthMin: number = 10,
    contentType?: string,
  ): Promise<{ url: string; fields: any }> {
    const conditions: PresignedPostOptions['Conditions'] = [
      ['content-length-range', contentLengthMin, contentLengthMax],
      // ['starts-with', '$Content-Type', contentType],
      // ['eq', '$Content-Type', contentType],
    ];
    // const fields = {
    //   success_action_status: '201',
    //   'Content-Type': contentType,
    // };

    try {
      const { url, fields: presignedFields } = await createPresignedPost(this.s3Client, {
        Bucket: this.bucketName,
        Key: presignedURLKey,
        Conditions: conditions,
        // Fields: fields,
        Expires: 3600,
      });

      return { url, fields: presignedFields };
    } catch (error) {
      this.logger.error('Error generating pre-signed post:', error);
      throw error;
    }
  }

  createPresignedUrlWithClient() {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: 'cover.png',
      Expires: 3600,
      ContentType: 'application/octet-stream',
    });
  }

  async uploadFileToS3(
    fileBuffer: Buffer,
    fileName: string,
    folderName: string,
  ): Promise<string> {
    const params: S3.PutObjectRequest = {
      Bucket: `${this.bucketName}/${folderName}`,
      Key: fileName,
      Body: fileBuffer,
    };

    try {
      const response = await this.s3.upload(params).promise();
      return response.Location; // Returns the URL of the uploaded file
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async deleteFileFromS3(s3Key: string): Promise<void> {
    const params = {
      Bucket: `${this.bucketName}`,
      Key: s3Key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(`Failed to delete file in S3: ${error.message}`);
    }
  }

  async downloadFileFromS3(s3Key: string): Promise<Buffer> {
    const params = {
      Bucket: `${this.bucketName}`,
      Key: s3Key,
    };

    try {
      const s3Object = await this.s3.getObject(params).promise();

      return s3Object.Body as Buffer;
    } catch (error) {
      throw new Error(`Failed to download file from S3: ${error.message}`);
    }
  }

  async streamFileFromS3(s3Key: string): Promise<Readable> {
    const params = {
      Bucket: `${this.bucketName}`,
      Key: s3Key,
    };

    const stream = this.s3.getObject(params).createReadStream();

    stream.on('error', (err) => {
      this.logger.error(`Failed to stream file from S3: ${err.message}`);
    });

    return stream;
  }

  async aptrack2GenerateGetObjectPresignedUrl(filePath: string): Promise<string> {
    return this.generateGetObjectPresignedUrl(filePath, this.aptrack2BucketName);
  }

  async aptrack2CertificateGenGetObjectPresignedUrl(filePath: string): Promise<string> {
    const certFilePath = filePath.replace(`${this.aptrack2CertBucketName}/`, '');
    const awsCred = this.configService.get('serverConfig').APTRACK2_S3_CREDENTIALS;
    const newS3Instance = new S3Client({
      credentials: {
        accessKeyId: process.env.APTRACK2_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.APTRACK2_AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.APTRACK2_AWS_SESSION_TOKEN
          ? process.env.APTRACK2_AWS_SESSION_TOKEN
          : null,
      },
      region: process.env.APTRACK2_AWS_REGION,
    });

    return await this.generateGetObjectPresignedUrl(
      certFilePath,
      this.aptrack2CertBucketName,
      newS3Instance,
    );
  }
}
