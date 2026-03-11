import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { DrmService } from './drm.service';
import { CreateDrmDto } from './dto/create-drm.dto';
import { UpdateDrmDto } from './dto/update-drm.dto';
import { UploadDrmDto } from './dto/upload-drm.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { DrmQueryDto } from './dto/drm-query.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
@Controller('admin/drm')
export class DrmController {
  constructor(private readonly drmService: DrmService) {}

  @Roles(Role.Admin, Role.Moderator)
  @Post()
  async createDrm(@Body() createDrmDto: CreateDrmDto) {
    try {
      await this.drmService.create(createDrmDto);

      return new ResponseHelper('created successfully');
    } catch (error) {
      console.log('DrmController->createDrm', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Post('upload')
  async upload(@Body() uploadDrmDto: UploadDrmDto) {
    try {
      const data = await this.drmService.upload(uploadDrmDto);

      return new ResponseHelper(data);
    } catch (error) {
      console.log('DrmController->upload', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Get()
  @TransformQuery(DrmQueryDto)
  async listDrm(@Query() queryDto: DrmQueryDto) {
    try {
      const searchKeys = ['title', 'resourceId'];
      const { drmBooks, count } = await this.drmService.listDrm(queryDto, searchKeys);

      return new ResponseHelper(drmBooks, count);
    } catch (error) {
      console.log('DrmController->listDrm', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Get(':id')
  async showDrm(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    drmId: number,
  ) {
    try {
      return new ResponseHelper(await this.drmService.showDrm(drmId));
    } catch (error) {
      console.log('DrmController->showDrm', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Patch(':id')
  async updateDrm(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    drmId: number,
    @Body() updateDrmDto: UpdateDrmDto,
  ) {
    try {
      await this.drmService.update(drmId, updateDrmDto);

      return new ResponseHelper('update successfully');
    } catch (error) {
      console.log('DrmController->updateDrm', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async removeDrm(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    drmId: number,
  ) {
    try {
      await this.drmService.removeDrm(drmId);

      return new ResponseHelper('deleted successfully');
    } catch (error) {
      console.log('DrmController->removeDrm', error);
      throw error;
    }
  }
}
