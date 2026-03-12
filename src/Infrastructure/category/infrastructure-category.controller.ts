import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { InfrastructureCategoryService } from './infrastructure-category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';

@Controller('infrastructure/category')
export class InfrastructureCategoryController {
  constructor(private readonly service: InfrastructureCategoryService) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const result = await this.service.create(dto);
    return new ResponseHelper(result);
  }

  @Get()
  async findAll() {
    const {items, count} = await this.service.findAll();
    return new ResponseHelper(items, count);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.service.findOne(+id);
    return new ResponseHelper(result);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
    const result = await this.service.update(+id, dto);
    return new ResponseHelper(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const result = await this.service.delete(+id);
    return new ResponseHelper(result);
  }
}