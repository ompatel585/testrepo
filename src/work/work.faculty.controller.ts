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
} from '@nestjs/common';
import { WorkService } from './work.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { WorkStatusDto } from './dto/work-status.dto';
import { Request } from 'express';
import { FacultyWorkFilterDto, FacultyWorkQueryDto } from './dto/faculty-work-filter.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { transformFilterKeysWithTableContext } from 'src/common/helper/transformFilterKeysWithTableContext.helper';
import { runInTransaction } from 'src/common/helper/transaction.helper';
import { DataSource } from 'typeorm';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@Roles(Role.Faculty)
@Controller('faculty/work')
export class FacultyController {
  constructor(
    private readonly workService: WorkService,
    private readonly dataSource: DataSource,
  ) {}

  @Patch(':id/status')
  async patchWorkStatus(
    @DefaultUser() user: DefaultUserResponse,
    @Body() workStatusDto: WorkStatusDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.workService.updateStatus(user, workStatusDto, workId, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->patchWorkStatus Update', error);
      throw error;
    }
  }

  @Get()
  @TransformQuery(FacultyWorkQueryDto)
  async facultyWorkList(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: FacultyWorkQueryDto,
  ) {
    try {
      const { centreId, unassigned, ...queryFilter } = queryDto.filter;
      // remove centreId, unassigned filter for faculty
      queryDto.filter = queryFilter as FacultyWorkFilterDto;
      queryDto.filter.reviewerId = user.id;

      const { works, count } = await this.workService.facultyWorkList(queryDto);
      return new ResponseHelper(works, count);
    } catch (error) {
      console.log('WorkController->facultyList', error);
      throw error;
    }
  }

  @Get(':id')
  async facultyWorkById(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      const data = await this.workService.facultyWorkById(workId, user);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->facultyList', error);
      throw error;
    }
  }
}
