import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { FileUploadService } from './file-upload.service';
import { PresignedURLKeyDto } from './dto/presigned-url-key.dto';
import { Request } from 'express';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get('get-object')
  async generatePresignedUrl(
    @Req() req: any,
    @Query(new ValidationPipe()) keydata: PresignedURLKeyDto,
  ) {
    try {
      const url = await this.fileUploadService.generateGetObjectPresignedUrl(
        keydata.presignedURLKey,
      );
      return { url };
    } catch (error) {
      console.log('error in generatePresignedUrl', error);
      throw error;
    }
  }

  @Public()
  @Get('/put-object')
  async PutPresignedUrl(
    @Req() req: Request,
    @Query(new ValidationPipe()) keydata: PresignedURLKeyDto,
  ) {
    try {
      console.log('check qury========', req.query);
      console.log('check PresignedURLKey========', keydata.presignedURLKey);

      const url = await this.fileUploadService.generatePutObjectPresignedUrl(
        keydata.presignedURLKey,
      );

      return { url };
    } catch (error) {
      console.log('error in generatePresignedUrl', error);
    }
  }
}
