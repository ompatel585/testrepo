import { Injectable } from '@nestjs/common';

import { Testimonial } from '../common/entities/testimonial.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { TestimonialQueryDto } from './dto/testimonial-filter.dto';
@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialRepository: Repository<Testimonial>,
    private fileUploadService: FileUploadService,
  ) {}

  async findAll(queryParams: TestimonialQueryDto, searchKeys?: string[]) {
    const queryBuilderInstance =
      this.testimonialRepository.createQueryBuilder('testimonial');
    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      searchKeys: searchKeys,
    });

    const [testimonials, count] = await queryBuilder.getManyAndCount();

    const presignedUrlPromises = [];

    for (const testimonial of testimonials) {
      // Adding presigned URL for testimonial file
      if (testimonial.filePath) {
        const thumbnailUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(testimonial.filePath)
          .then((url) => {
            testimonial.filePath = url;
          });
        presignedUrlPromises.push(thumbnailUrlPromise);
      }
    }

    await Promise.all(presignedUrlPromises);

    return { testimonials, count };
  }
}
