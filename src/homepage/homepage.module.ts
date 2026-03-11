import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomePageService } from './homepage.service';
import { HomePageController } from './homepage.controller';
import { HomePageAssets } from 'src/common/entities/homepageAssets.entity';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([HomePageAssets]), FileUploadModule],
  controllers: [HomePageController],
  providers: [HomePageService],
  exports: [HomePageService],
})
export class HomePageModule {}
