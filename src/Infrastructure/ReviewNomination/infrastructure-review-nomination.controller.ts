import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';

import { InfrastructureReviewNominationService } from './infrastructure-review-nomination.service';
import { CreateReviewNominationDto } from './dto/create-review-nomination.dto';
import { ResponseHelper } from '../../common/helper/response.helper';

@Controller('infrastructure/review/nomination')
export class InfrastructureReviewNominationController {

  constructor(
    private readonly service: InfrastructureReviewNominationService,
  ) {}

  @Post()
  async create(@Body() dto: CreateReviewNominationDto) {
    const result = await this.service.create(dto);
    return new ResponseHelper(result);
  }

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.service.findAll(startDate, endDate);
    return new ResponseHelper(result);
  }

  @Get('brand/:id')
  async findByBrand(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    const result = await this.service.findByBrand(id);
    return new ResponseHelper(result);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    const result = await this.service.findOne(id);
    return new ResponseHelper(result);
  }

  @Patch()
  async update(@Body() dto: CreateReviewNominationDto) {
    const result = await this.service.update(dto);
    return new ResponseHelper(result);
  }

  @Post('submit')
  async submit(@Body() dto: CreateReviewNominationDto) {
    const result = await this.service.submit(dto);
    return new ResponseHelper(result);
  }
}