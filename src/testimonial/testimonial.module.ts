import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from 'src/common/entities/testimonial.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial]), FileUploadModule],
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
