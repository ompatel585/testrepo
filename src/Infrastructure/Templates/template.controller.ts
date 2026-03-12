import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';

@Controller('/infrastructure/review/template')
export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  @Post('/')
  async create(@Body() body: CreateTemplateDto) {
    try {
      const template = await this.service.create(body);

      return new ResponseHelper({
        message: 'Template created successfully',
      });
    } catch (error) {
      console.log('TemplateController->create', error);
      throw new HttpException(
        { message: error.message || 'Internal Server Error' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/')
  async findAll() {
    try {
      const templates = await this.service.findAll();

      return new ResponseHelper(templates, templates.length, {
        message: 'Templates fetched successfully',
      });
    } catch (error) {
      console.log('TemplateController->findAll', error);
      throw error;
    }
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const template = await this.service.findOne(id);

      return new ResponseHelper(template, 1, {
        message: 'Template fetched successfully',
      });
    } catch (error) {
      console.log('TemplateController->findOne', error);
      throw error;
    }
  }

  @Patch('/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTemplateDto) {
    try {
      const template = await this.service.update(id, body);

      return new ResponseHelper(template, 1, {
        message: 'Template updated successfully',
      });
    } catch (error) {
      console.log('TemplateController->update', error);
      throw new HttpException(
        { message: error.message || 'Internal Server Error' },
        HttpStatus.BAD_REQUEST,
      );
      // throw error;
    }
  }

  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.service.remove(id);
      return new ResponseHelper({
        message: result.message,
      });
    } catch (error) {
      console.log('TemplateController->remove', error);
      throw error;
    }
  }
}
