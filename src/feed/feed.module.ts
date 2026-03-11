import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from 'src/common/entities/work.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Work]), FileUploadModule],
  providers: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
