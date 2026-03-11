import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CentreWallService } from './centreWall.service';
import { CreateCentreWallDto } from '../dto/create-centreWall.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { UpdateCentreWallDto } from '../dto/updateCentreWall.dto';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { CenterDashboardFilterDto } from '../dto/centre-wall-filter.dto';

@Controller('centre-wall')
export class CentreWallController {
  constructor(private readonly centrewallService: CentreWallService) { }

  @Post()
  async createCentreWall(@Body() dto: CreateCentreWallDto) {
    try {
      const result = await this.centrewallService.create(dto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('CentreWallController -> createWall:', error);
      throw error;
    }
  }

  @Get('get-centreWall')
  async findCentreWall(
    @Query('eventId') eventId: string,
    @Query('centerId') centerId: string,
  ) {
    try {
      const result = await this.centrewallService.getCentreWall(
        Number(centerId),
        Number(eventId),
      );
      return new ResponseHelper(result);
    } catch (error) {
      console.error('CentreWallController -> findCentreWall:', error);
      throw error;
    }
  }

  @Get('get-CenterDashboard')
  async getSubmissionStatusCount(
    @Query() queryParams: QueryParamsDto,
    @Query() filter: CenterDashboardFilterDto,
    @Query('centerId') centerId: number,
    @Query('eventId') eventId: number,
  ) {
    const result = await this.centrewallService.getCenterDashboard(
      Number(centerId),
      Number(eventId),
      { ...queryParams, filter },
    );
    return new ResponseHelper(result);
  }

  @Put('update')
  async updateCentreWall(@Body() dto: UpdateCentreWallDto) {
    try {
      const result = await this.centrewallService.updateCentreWall(dto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('CentreWallController -> updateCentreWall:', error);
      throw error;
    }
  }

  @Get('center-points')
  async updateCenterPoints(
    @Query('centerId') centerId?: number,
    @Query('eventId') eventId?: number,
    @Query() queryParams?: QueryParamsDto,
  ) {
    try {
      const result = await this.centrewallService.GetCenterPointsFromTable(
        centerId ? +centerId : undefined,
        eventId ? +eventId : undefined,
         queryParams,
      );
      return new ResponseHelper(result);
    } catch (error) {
      console.error('CentreWallController -> updateCenterPoints:', error);
      throw error;
    }
  }
}
