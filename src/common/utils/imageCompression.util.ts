import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { imageCompressionContext } from '../constants';
import {
  adjustImageFactors,
  imageCompressionWidthRatio,
  imageSizeQualityFactor,
  skipCompressionCriteria,
} from '../helper/imageCompression.helper';
import { Injectable } from '@nestjs/common';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
export type CompressionCriteria = {
  minSize: number; // Minimum file size in KB
  maxSize: number; // Maximum file size in KB
  quality: number; // Compression quality percentage
};

export type imageType = 'thumbnail' | 'view';

export interface AdjustedQualityParams {
  originalWidth: number;
  referenceWidth: number;
  quality: number;
  multiplier: number;
  imageSizeFactor: number;
}

export type imageContext = keyof typeof imageCompressionContext;

export type QualityCriteria = {
  imageType: imageType;
  compressionCriteria: CompressionCriteria[];
};

export type SizeConfig = { imageType: imageType; width?: number; height?: number };

export type OutputDirs = Record<string, string>;

export interface CompressionServiceParams {
  inputFiles: string[]; // Array of file paths
  qualityCriteria: QualityCriteria[];
  sizes: SizeConfig[]; // Array of size configurations
  outputFormats: string[]; // List of formats to compress ['webp', 'jpeg']
  outputDirs: OutputDirs; // Directory structure for storing outputs
  imageContext: imageContext;
}

@Injectable()
export class ImageCompressionUtilClass {
  constructor(private cloudLoggerService: CloudLoggerService) {}

  private static formatSize(sizeInBytes: number): string {
    return sizeInBytes >= 1024 * 1024
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(sizeInBytes / 1024).toFixed(2)} KB`;
  }

  private static getFileSizeKB(filePath: string): number {
    const stats = fs.statSync(filePath);
    return stats.size / 1024; // Convert bytes to KB
  }

  private static getCompressionQualityBySizeAndType(
    originalSize: number,
    imageType: imageType,
    compressionCriteria: CompressionCriteria[],
    imageContext: imageContext,
  ): { compressionQuality: number; isOriginal: boolean } {
    const matchedCriteria = compressionCriteria.find(
      (range) => originalSize >= range.minSize && originalSize <= range.maxSize,
    );

    if (matchedCriteria) {
      const skipCriteria = skipCompressionCriteria.find(
        (item) => item.context === imageContext && item.imageType === imageType,
      );

      const isOriginal =
        (matchedCriteria.quality === 100 &&
          originalSize <= skipCriteria.maxSize &&
          imageType === 'view') ||
        (matchedCriteria.quality === 100 &&
          originalSize <= skipCriteria.maxSize &&
          imageType === 'thumbnail');

      return { compressionQuality: matchedCriteria.quality, isOriginal };
    }

    return { compressionQuality: 100, isOriginal: true };
  }

  private static calculateAdjustedQuality({
    originalWidth,
    referenceWidth,
    quality,
    multiplier,
    imageSizeFactor,
  }: AdjustedQualityParams): number {
    const widthFactor = Math.max(1, originalWidth / referenceWidth);

    if (widthFactor > 1) {
      quality -= Math.round(imageSizeFactor * widthFactor * multiplier);
    }
    return Math.max(1, quality);
  }

  public async compressImages(params: CompressionServiceParams): Promise<boolean> {
    const {
      inputFiles,
      qualityCriteria,
      sizes,
      outputFormats,
      outputDirs,
      imageContext,
    } = params;

    let atLeastOneProcessed = false;

    // Check all output directories exist
    Object.values(outputDirs).forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const processingTasks = inputFiles.map(async (filePath) => {
      const fileName = path.parse(filePath).name;
      const originalSize = ImageCompressionUtilClass.getFileSizeKB(filePath);
      const metadata = await sharp(filePath).metadata();

      for (const size of sizes) {
        const typeCriteria = qualityCriteria.find(
          (criteria) => criteria.imageType === size.imageType,
        );

        if (!typeCriteria) continue;

        const { compressionQuality, isOriginal } =
          ImageCompressionUtilClass.getCompressionQualityBySizeAndType(
            originalSize,
            size.imageType,
            typeCriteria.compressionCriteria,
            imageContext,
          );

        if (isOriginal) continue;

        atLeastOneProcessed = true;

        const formatTasks = outputFormats.map((format) =>
          this.processSingleImage({
            filePath,
            fileName,
            format,
            size,
            compressionQuality,
            outputDir: outputDirs[format],
            imageContext,
          }),
        );

        await Promise.all(formatTasks);
      }
    });

    await Promise.all(processingTasks);
    return atLeastOneProcessed;
  }

  private async processSingleImage({
    filePath,
    fileName,
    format,
    size,
    compressionQuality,
    outputDir,
    imageContext,
  }: {
    filePath: string;
    fileName: string;
    format: string;
    size: SizeConfig;
    compressionQuality: number;
    outputDir: string;
    imageContext: imageContext;
  }): Promise<void> {
    const outputFilePath = path.join(outputDir, `${fileName}.${format}`);
    try {
      const transformer = sharp(filePath).withMetadata();
      const metadata = await transformer.metadata();
      const originalWidth = metadata.width;
      const originalHeight = metadata.height;

      if (!originalWidth || !originalHeight) {
        throw new Error(`Invalid image dimensions for ${fileName}`);
      }

      let adjustedQuality = compressionQuality;

      if (size.imageType === 'view') {
        const adjustingFactors = adjustImageFactors.find(
          (item) => item.context === imageContext,
        );
        const fileSize = ImageCompressionUtilClass.getFileSizeKB(filePath);
        const imageSizeFactor = imageSizeQualityFactor
          .find((item) => item.context === imageContext)
          .func(fileSize);

        adjustedQuality = ImageCompressionUtilClass.calculateAdjustedQuality({
          originalWidth,
          referenceWidth: adjustingFactors.referenceWidth,
          quality: compressionQuality,
          multiplier: adjustingFactors.multiplier,
          imageSizeFactor,
        });
      }

      const aspectRatio = originalWidth / originalHeight;
      const widthRatio = imageCompressionWidthRatio
        .find((item) => item.context === imageContext)
        .func(originalWidth, originalHeight, size.imageType);

      const targetWidth = Math.round(originalWidth * widthRatio);
      const targetHeight = Math.round(targetWidth / aspectRatio);

      transformer.resize({
        width: targetWidth,
        height: targetHeight,
      });

      transformer[format]({
        quality: adjustedQuality,
        progressive: true,
        lossless: false,
      });

      await transformer.toFile(outputFilePath);

      const processedSize = ImageCompressionUtilClass.formatSize(
        fs.statSync(outputFilePath).size,
      );
      const orgSize = ImageCompressionUtilClass.formatSize(fs.statSync(filePath).size);

      console.log(
        `Processed ${fileName} -> ${format}: ${orgSize} (${size.imageType || 'original'}): ${processedSize}`,
      );
    } catch (error) {
      console.error(`Error processing ${fileName} -> ${format}:`, error);
      this.cloudLoggerService.error(`Error processing ${fileName} -> ${format}:`, error);
    }
  }
}
