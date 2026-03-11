import { Controller, Get, Query, Req } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { TestimonialFilterDto, TestimonialQueryDto } from './dto/testimonial-filter.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { Public } from 'src/common/decorator/public.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Roles(Role.Student)
  @Get()
  @TransformQuery(TestimonialQueryDto)
  async fetchTestimonial(@Req() req: any, @Query() queryDto: TestimonialQueryDto) {
    try {
      const searchKeys = [];
      queryDto.filter.brandId = req.user.brandId;
      const { testimonials, count } = await this.testimonialService.findAll(
        queryDto,
        searchKeys,
      );
      return new ResponseHelper(testimonials, count);
    } catch (error) {
      console.log('WorkController->myWork', error);
      throw error;
    }
  }
}
