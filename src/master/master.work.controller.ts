import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { MasterWorkService } from './master.work.service';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { WorkCategoryQueryDto } from './dto/work/work-category-query.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { AddWorkCategoryDto } from './dto/work/add-work-category.dto';
import { EditWorkCategory } from './dto/work/edit-work-category.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateWorkCategoryStatus } from './dto/work/update-work-category-status.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@Controller('master/work')
export class MasterWorkController {
  constructor(private masterWorkService: MasterWorkService) {}

  @Roles(Role.Admin)
  @Post('work-category')
  async create(@Body() dto: AddWorkCategoryDto) {
    try {
      await this.masterWorkService.create(dto);

      return new ResponseHelper('success');
    } catch (error) {
      console.error('MasterWorkController => create', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Student)
  @Get('work-category')
  @TransformQuery(WorkCategoryQueryDto)
  async list(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: WorkCategoryQueryDto,
  ) {
    try {
      if (user.activeRole.role == Role.Student) {
        queryDto.filter.brandId = user.activeRole.brandId;
        queryDto.filter.status = 1;
      }

      const searchKeys = ['name'];
      const { records, count } = await this.masterWorkService.list(queryDto, searchKeys);

      return new ResponseHelper({ records, count });
    } catch (error) {
      console.error('MasterWorkController => list', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Get('work-category/:id')
  async view(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      return new ResponseHelper(await this.masterWorkService.view(id));
    } catch (error) {
      console.error('MasterWorkController => view', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Put('work-category/:id')
  async edit(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body()
    dto: EditWorkCategory,
  ) {
    try {
      await this.masterWorkService.edit(id, dto);

      return new ResponseHelper('Success');
    } catch (error) {
      console.error('MasterWorkController => edit', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Patch('work-category/:id/status')
  async status(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body()
    dto: UpdateWorkCategoryStatus,
  ) {
    try {
      await this.masterWorkService.status(id, dto);

      return new ResponseHelper('Success');
    } catch (error) {
      console.error('MasterWorkController => status', error);
      throw error;
    }
  }
}
