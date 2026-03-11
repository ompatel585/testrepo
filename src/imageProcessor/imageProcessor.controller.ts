import { Body, Controller, Get, Post } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ImageProcessorService } from './imageProcessor.service';
import { Public } from 'src/common/decorator/public.decorator';
import {
  imageType,
  QualityCriteria,
  SizeConfig,
} from 'src/common/utils/imageCompression.util';
import { imageCompressionContext } from '../common/constants';
import {
  thumbnailQualityCriteria,
  viewQualityCriteria,
} from '../common/helper/workImageCompression.helper';
import { CompressS3ImagesDto } from './dto/compress-s3-images.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

@Controller('image-processor')
export class ImageProcessorController {
  constructor(private readonly imageProcessorService: ImageProcessorService) {}

  @Roles(Role.Service)
  @Get('compress-local')
  async compressLocalImages() {
    const inputDir = 'work-image/input'; // Directory containing images for processing
    const outputDirs = {
      webp: 'work-image/output/webp',
      avif: 'work-image/output/avif',
      jpeg: 'work-image/output/jpeg',
    };

    const sizes: SizeConfig[] = [{ imageType: 'thumbnail' }, { imageType: 'view' }];

    const outputFormats = ['jpeg'];

    const qualityCriteria: QualityCriteria[] = [
      { imageType: 'thumbnail', compressionCriteria: thumbnailQualityCriteria },
      { imageType: 'view', compressionCriteria: viewQualityCriteria },
    ];

    // Read files from the input directory
    const inputFiles = fs
      .readdirSync(inputDir)
      .filter((file) =>
        ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase()),
      )
      .map((file) => path.join(inputDir, file));

    // Call the service
    console.log('Starting image compression...');
    await this.imageProcessorService.processLocalImages({
      inputFiles,
      qualityCriteria,
      sizes,
      outputFormats,
      outputDirs,
      batchSize: 3,
      imageContext: imageCompressionContext.work,
    });

    return { message: 'Image compression completed successfully.' };
  }

  @Post('compress-work-images')
  @Roles(Role.Service)
  async compressS3Images(@Body() params: CompressS3ImagesDto) {
    const { images } = params;
    const qualityCriteria: QualityCriteria[] = [
      { imageType: 'thumbnail', compressionCriteria: thumbnailQualityCriteria },
      { imageType: 'view', compressionCriteria: viewQualityCriteria },
    ];

    await this.imageProcessorService.processS3WorkImages({
      images,
      sizes: [{ imageType: 'thumbnail' }, { imageType: 'view' }],
      outputFormats: ['jpeg'],
      qualityCriteria: qualityCriteria,
      imageContext: imageCompressionContext.work,
    });

    return { message: 'S3 image compression completed successfully.' };
  }
}
