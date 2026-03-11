import { Injectable } from '@nestjs/common';
import {
  ImageCompressionUtilClass,
  imageContext,
  OutputDirs,
  QualityCriteria,
  SizeConfig,
} from '../common/utils/imageCompression.util';
import fs from 'fs';
import { S3 } from 'aws-sdk';
import path from 'path';
import { v4 as uuid4 } from 'uuid';
import { Repository } from 'typeorm';
import { Work } from 'src/common/entities/work.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Files } from 'src/common/entities/files.entity';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageProcessorService {
  private readonly s3 = new S3();
  private bucketName = process.env.S3_BUCKET_NAME;

  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
    @InjectRepository(Files)
    private fileRepository: Repository<Files>,
    private readonly imageCompressionUtilClass: ImageCompressionUtilClass,
    private cloudLoggerService: CloudLoggerService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3(this.configService.get('serverConfig').S3_CREDENTIALS);
  }

  async processLocalImages({
    inputFiles,
    qualityCriteria,
    sizes,
    outputFormats,
    outputDirs,
    batchSize = 3,
    imageContext,
  }: {
    inputFiles: string[];
    qualityCriteria: QualityCriteria[];
    sizes: SizeConfig[];
    outputFormats: string[];
    outputDirs: OutputDirs;
    batchSize?: number;
    imageContext: imageContext;
  }): Promise<void> {
    const totalBatches = Math.ceil(inputFiles.length / batchSize);

    // Ensure all output directories exist
    Object.values(outputDirs).forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    for (let i = 0; i < totalBatches; i++) {
      const batch = inputFiles.slice(i * batchSize, (i + 1) * batchSize);

      console.log(`Processing batch ${i + 1} of ${totalBatches}`);

      try {
        for (const filePath of batch) {
          const fileName = path.basename(filePath);

          for (const compressionType of ['thumbnail', 'view'] as const) {
            const selectedSize = sizes.find((size) => size.imageType === compressionType);
            if (!selectedSize) {
              console.error(
                `No matching size configuration for compression type: ${compressionType}`,
              );
              continue;
            }

            // Adjust output directories for the current compression type
            const adjustedOutputDirs: Record<string, string> = {};
            for (const format of outputFormats) {
              const dir = path.join(outputDirs[format], compressionType);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              adjustedOutputDirs[format] = dir;
            }

            // Call compressImages for the current compression type
            console.log(`Processing ${compressionType} for ${fileName}`);
            await this.imageCompressionUtilClass.compressImages({
              inputFiles: [filePath],
              qualityCriteria,
              sizes: [selectedSize],
              outputFormats,
              outputDirs: adjustedOutputDirs,
              imageContext,
            });
          }
        }

        console.log(`Batch ${i + 1} processed successfully.`);
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
      }
    }

    console.log('All batches processed.');
  }

  async processS3WorkImages({
    images,
    sizes,
    outputFormats,
    qualityCriteria,
    imageContext,
  }: {
    images: {
      imageKey: string;
      imageType: 'thumbnail' | 'view';
      s3OutputPath: string;
    }[];
    sizes: SizeConfig[];
    outputFormats: string[];
    qualityCriteria: QualityCriteria[];
    imageContext: imageContext;
  }): Promise<void> {
    const uniqueTempDir = path.join('./temp', uuid4());

    if (!fs.existsSync(uniqueTempDir)) {
      fs.mkdirSync(uniqueTempDir, { recursive: true });
    }

    try {
      for (const { imageKey, imageType, s3OutputPath } of images) {
        const fileName = path.basename(imageKey);

        const localFilePath = path.join(uniqueTempDir, fileName);

        const selectedSize = sizes.find((size) => size.imageType === imageType);
        if (!selectedSize) {
          console.error(
            `No matching size configuration for compression type: ${imageType}`,
          );
          continue;
        }

        // Download work image from S3
        await this.downloadFromS3(this.bucketName, imageKey, localFilePath);

        // Create temporary output directories for each format
        const outputDirs: Record<string, string> = {};
        for (const format of outputFormats) {
          const dir = path.join(uniqueTempDir, imageType, format);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          outputDirs[format] = dir;
        }

        // Compress the work image
        const isProcessed = await this.imageCompressionUtilClass.compressImages({
          inputFiles: [localFilePath],
          qualityCriteria,
          sizes: [selectedSize],
          outputFormats,
          outputDirs,
          imageContext,
        });

        console.log('isProcessed===>', isProcessed);

        if (!isProcessed) {
          console.info(`Image ${fileName} was skipped during compression.`);
          continue; // Skip upload if image was not processed
        }

        for (const format of outputFormats) {
          const compressedFileName = `${path.parse(fileName).name}.${format}`; // Adjust filename to include the new format
          const compressedFilePath = path.join(outputDirs[format], compressedFileName);

          if (fs.existsSync(compressedFilePath)) {
            const s3Key = `${s3OutputPath}/${compressedFileName}`;
            await this.uploadToS3(this.bucketName, s3Key, compressedFilePath);
            const workId = s3Key.split('/')[1];

            try {
              if (imageType === 'thumbnail') {
                let work = await this.workRepository.findOne({
                  where: { id: parseInt(workId) },
                });
                console.log('work===>', work.id);

                if (work) {
                  work.compressedThumbnail = s3Key;
                  await this.workRepository.save(work);
                } else {
                  console.error(`Work with ID ${workId} not found.`);
                  this.cloudLoggerService.error(`Work with ID ${workId} not found.`);
                }
              }

              if (imageType === 'view') {
                let file = await this.fileRepository.findOne({
                  where: { filePath: imageKey },
                });

                console.log('file===>', file.id);

                if (file) {
                  file.compressedFilePath = s3Key;
                  await this.fileRepository.save(file);
                } else {
                  console.error(`File with path ${imageKey} not found.`);
                  this.cloudLoggerService.error(`File with path ${imageKey} not found.`);
                }
              }
            } catch (error) {
              console.error(
                `work|file thumbnail/image update failed for image: ${s3Key}: ${error}`,
              );
              this.cloudLoggerService.error(
                `work|file thumbnail/image update failed for image: ${s3Key}: ${error}`,
              );
            }
          } else {
            console.error('File not found after compression:', compressedFilePath);
            this.cloudLoggerService.error(
              'File not found after compression:',
              compressedFilePath,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error processing S3 images:', error);
    } finally {
      // Cleanup unique temp directory
      if (fs.existsSync(uniqueTempDir)) {
        fs.rmSync(uniqueTempDir, { recursive: true, force: true });
      }
    }
  }

  //   ============================================helper===============================================================

  private async downloadFromS3(
    bucketName: string,
    key: string,
    localFilePath: string,
  ): Promise<void> {
    const s3Object = await this.s3.getObject({ Bucket: bucketName, Key: key }).promise();

    return new Promise((resolve, reject) => {
      fs.writeFile(localFilePath, s3Object.Body as Buffer, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  private async uploadToS3(
    bucketName: string,
    key: string,
    filePath: string,
  ): Promise<void> {
    const fileContent = fs.readFileSync(filePath);

    await this.s3
      .putObject({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: this.getContentType(filePath),
      })
      .promise();
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.webp':
        return 'image/webp';
      case '.jpeg':
      case '.jpg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
