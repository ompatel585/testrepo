import { Module } from '@nestjs/common';
import { PortFolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from 'src/common/entities/portfolio.entity';
import { Work } from 'src/common/entities/work.entity';
import { WorkModule } from 'src/work/work.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, Work]), WorkModule, FileUploadModule],
  controllers: [PortFolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
