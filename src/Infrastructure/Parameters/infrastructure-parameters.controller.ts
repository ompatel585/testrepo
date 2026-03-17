import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  Query,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InfrastructureParametersService } from './infrastructure-parameters.service';
import { CreateInfrastructureParameterDto } from './dto/create-infrastructure-parameter.dto';
import { ResponseHelper } from '../../common/helper/response.helper';
import { Patch, Delete } from '@nestjs/common';
import { UpdateInfrastructureParameterDto } from './dto/create-infrastructure-parameter.dto';

@Controller(['infrastructure/parameter', 'infrastructure-parameters'])
export class InfrastructureParametersController {

  constructor(
    private readonly infrastructureParametersService: InfrastructureParametersService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateInfrastructureParameterDto) {
    try {
      const result = await this.infrastructureParametersService.create(createDto);
      return new ResponseHelper(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create infrastructure parameter');
    }
  }

  @Get()
  async findAll(@Query('subparameter') subparameter?: string) {
    try {
      const result = await this.infrastructureParametersService.findAll(subparameter);
      return new ResponseHelper(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch infrastructure parameters');
    }
  }

  @Get('brand/:id')
  async findByBrand(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Query('subparameter') subparameter?: string,
  ) {
    try {
      const result = await this.infrastructureParametersService.findByBrand(id, subparameter);
      return new ResponseHelper(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch parameters by brand');
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const result = await this.infrastructureParametersService.findOne(id);
      return new ResponseHelper(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch infrastructure parameter');
    }
  }

  @Patch(':id')
async update(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
  @Body() updateDto: UpdateInfrastructureParameterDto,
) {
  try {
    const result = await this.infrastructureParametersService.update(id, updateDto);
    return new ResponseHelper(result);
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to update infrastructure parameter');
  }
}

@Delete(':id')
async remove(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  try {
    const result = await this.infrastructureParametersService.remove(id);
    return new ResponseHelper(result);
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to delete infrastructure parameter');
  }
}

}