import {
  Controller,
  Body,
  Param,
  Get,
  ParseIntPipe,
  HttpStatus,
  Patch,
  Req,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WorkService } from './work.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { Request } from 'express';
import { FacultyWorkFilterDto, FacultyWorkQueryDto } from './dto/faculty-work-filter.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { transformFilterKeysWithTableContext } from 'src/common/helper/transformFilterKeysWithTableContext.helper';

import { UpdateWorkReviewerDto } from './dto/update-work-reviewer.dto';
import { CentreEmployeeWorkService } from './centre-employee-work.service';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { BusinessException } from 'src/common/exceptions/business.exception';

@Roles(Role.CH)
@Controller('centre-employee/work')
export class CenterEmployeeWorkController {
  private readonly logger = new Logger('centre-employee');
  constructor(
    private readonly workService: WorkService,
    private readonly workCentreAdminService: CentreEmployeeWorkService,
  ) {}

  /*  @Get()
  @TransformQuery(FacultyWorkQueryDto)
  async workList(@Req() req: any, @Query() facultyWorkQueryDto: FacultyWorkQueryDto) {
    try {
      if (facultyWorkQueryDto.filter.unassigned) {
        facultyWorkQueryDto.filter.reviewerId = null;
      } else {
        facultyWorkQueryDto.exclusion.reviewerId = null;
      }

      // removing unassigned from dto
      const { unassigned, ...queryFilter } = facultyWorkQueryDto.filter;
      facultyWorkQueryDto.filter = queryFilter as FacultyWorkFilterDto;
      facultyWorkQueryDto.filter.centreId = req.user.centreId;

      const filterMappings = {
        centreId: 'user.centreId',
      };

      facultyWorkQueryDto.filter = transformFilterKeysWithTableContext(
        facultyWorkQueryDto,
        filterMappings,
      );

      const { works, count } =
        await this.workService.facultyWorkList(facultyWorkQueryDto);
      return new ResponseHelper(works, count);
    } catch (error) {
      console.log('CenterEmployeeWorkController->workList', error);
      throw error;
    }
  }

  @Get(':id')
  async workById(
    @Req() req: Request,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      const data = await this.workCentreAdminService.workById(workId, req.user);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('CenterEmployeeWorkController->workById', error);
      throw error;
    }
  }

  @Patch('reviewer')
  async updateWorkReviewer(
    @Req() req: Request,
    @Body() updateWorkReviewerDto: UpdateWorkReviewerDto,
  ) {
    try {
      await this.workCentreAdminService.updateWorkReviewer(
        req.user,
        updateWorkReviewerDto,
      );

      return new ResponseHelper('reviewer updated successfully');
    } catch (error) {
      console.log('CenterEmployeeWorkController->updateWorkReviewer Update', error);
      throw error;
    }
  } */
}
