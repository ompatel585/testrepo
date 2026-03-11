import { Controller, Post, Get, Body, Param, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { InfrastructureParametersService } from './infrastructure-parameters.service';
import { CreateInfrastructureParameterDto } from './dto/create-infrastructure-parameter.dto';
import { ResponseHelper } from '../../common/helper/response.helper';

@Controller('infrastructure-parameters')
export class InfrastructureParametersController {
  constructor(
    private readonly infrastructureParametersService: InfrastructureParametersService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateInfrastructureParameterDto) {
    const result = await this.infrastructureParametersService.create(createDto);
    return new ResponseHelper(result);
  }

  @Get()
  async findAll() {
    const result = await this.infrastructureParametersService.findAll();
    return new ResponseHelper(result);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    const result = await this.infrastructureParametersService.findOne(id);
    return new ResponseHelper(result);
  }
}

