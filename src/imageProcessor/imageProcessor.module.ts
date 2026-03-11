import { Module } from '@nestjs/common';
import { ImageProcessorService } from './imageProcessor.service';
import { ImageProcessorController } from './imageProcessor.controller';
import { Work } from 'src/common/entities/work.entity';
import { WorkModule } from 'src/work/work.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from 'src/common/entities/files.entity';
import { ImageCompressionUtilClass } from 'src/common/utils/imageCompression.util';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Work, Files]), WorkModule, CloudLoggerModule],
  providers: [ImageProcessorService, ImageCompressionUtilClass],
  controllers: [ImageProcessorController],
  exports: [ImageProcessorService],
})
export class ImageProcessorModule {}
