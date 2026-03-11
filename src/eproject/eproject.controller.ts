import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AddEprojectDto } from './dto/add-eproject.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { Public } from 'src/common/decorator/public.decorator';
import { EprojectService } from './eproject.service';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { EprojectListQueryDto } from './dto/eproject-list-query.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateEprojectDto } from './dto/update-eproject.dto';
import { AllocateEprojectDto } from './dto/allocate-eproject.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@Controller('eproject')
export class EprojectController {
  constructor(private readonly eprojectService: EprojectService) {}

  @Roles(Role.Student)
  @Get()
  @TransformQuery(EprojectListQueryDto)
  async findAll(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: EprojectListQueryDto,
  ) {
    try {
      queryDto.filter.studentKey = user.userId;

      const searchKeys = [];
      const { records, nextPage } = await this.eprojectService.findAll(
        user,
        queryDto,
        searchKeys,
      );

      return new ResponseHelper(records, 0, { nextPage });
    } catch (error) {
      console.log('EprojectController->findAll', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Post()
  async create(@Body() addEprojectDto: AddEprojectDto) {
    try {
      await this.eprojectService.create(addEprojectDto);

      return new ResponseHelper('success');
    } catch (error) {
      console.log('EprojectController->create', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Patch(':eprojectExamCode/update')
  async update(
    @Param('eprojectExamCode') eprojectExamCode: string,
    @Body() updateEprojectDto: UpdateEprojectDto,
  ) {
    try {
      await this.eprojectService.update(eprojectExamCode, updateEprojectDto);

      return new ResponseHelper('success');
    } catch (error) {
      console.log('EprojectController->update', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Patch(':eprojectExamCode/:studentKey/allocate')
  async allocate(
    @Param('eprojectExamCode') eprojectExamCode: string,
    @Param('studentKey') studentKey: string,
    @Body() allocateEprojectDto: AllocateEprojectDto,
  ) {
    try {
      await this.eprojectService.allocate(
        eprojectExamCode,
        studentKey,
        allocateEprojectDto,
      );

      return new ResponseHelper('success');
    } catch (error) {
      console.log('EprojectController->allocate', error);
      throw error;
    }
  }
}
