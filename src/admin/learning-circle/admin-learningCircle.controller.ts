import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  Query,
  Post,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { AdminLearningCircleQueryDto } from './dto/admin-learningCircle-filter.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { AdminLearningCircleService } from './admin-learningCircle.service';
import { AdminLearningCircleUpdateDto } from './dto/admin-learningCircle-update.dto';
import { AdminCreateLearningCircleDto } from './dto/admin-learningCircle-create.dto';
import { AdminLearningCircleUpdateContentFileDto } from './dto/admin-learningCircle-update-contentFile.dto';
import { AdminLearningCircleUpdateVideoFileDto } from './dto/admin-learningCircle-update-videoFile.dto';
import { AdminLearningCircleUpdateThumbnailFileDto } from './dto/admin-learningCircle-update-thumbnail.dto';
import { TaxonomyBrandQueryDto } from './dto/taxonomybrand-query.dto';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/entities/userRole.entity';

@Controller('admin/learning-circle')
export class AdminLearningCircleController {
  constructor(
    private readonly adminLearningCircleService: AdminLearningCircleService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  @Roles(Role.Admin, Role.Moderator, Role.DigitalAuditor)
  @Get('taxonomybrand')
  @TransformQuery(TaxonomyBrandQueryDto)
  async getTaxonomyBrands(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: TaxonomyBrandQueryDto,
  ) {
    try {
      if (
        [Role.Moderator, Role.DigitalAuditor].includes(user.activeRole.role) &&
        queryDto?.filterForModerator
      ) {
        const subBrandIds = user.activeRole.subBrandIds;

        queryDto.filter.brandId = subBrandIds;
      }

      queryDto.limit = -1;
      return await this.adminLearningCircleService.getTaxonomyBrands(queryDto);
    } catch (error) {
      console.log('deleteLearningCircleById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator, Role.DigitalAuditor)
  @Get()
  @TransformQuery(AdminLearningCircleQueryDto)
  async getLearningCircles(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: AdminLearningCircleQueryDto,
  ) {
    try {
      if (user.activeRole.role == Role.Moderator) {
        const subBrandIds = user.activeRole.subBrandIds;
        queryDto.filter.brandId = subBrandIds;
      }

      const searchKeys = ['title'];
      const { learningCircles, count } =
        await this.adminLearningCircleService.getLearningCircleData(queryDto, searchKeys);
      return new ResponseHelper(learningCircles, count);
    } catch (error) {
      console.log('getLearningCircles', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Post()
  async createLearningCircleItem(
    @Body() createLearningCircleItem: AdminCreateLearningCircleDto,
  ) {
    try {
      return new ResponseHelper(
        await this.adminLearningCircleService.createLearningCircleItem(
          createLearningCircleItem,
        ),
      );
    } catch (error) {
      console.log('createLearningCircleItem', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator, Role.DigitalAuditor)
  @Get(':learningCircleId')
  async getLearningCircleDetailById(
    @Req() req: Request,
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.adminLearningCircleService.getLearningCircleDetailById(
          learningCircleId,
        ),
      );
    } catch (error) {
      console.log('getLearningCircleDetailById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Patch(':learningCircleId')
  async patchLearningCircleById(
    @Body() updateLearningCircleItem: AdminLearningCircleUpdateDto,
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      await this.adminLearningCircleService.patchLearningCircleItemById(
        updateLearningCircleItem,
        learningCircleId,
      );
      return new ResponseHelper('updated successfully');
    } catch (error) {
      console.log('patchLearningCircleById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Patch(':learningCircleId/contentFile')
  async updateContentFileById(
    @Body() contentFileDto: AdminLearningCircleUpdateContentFileDto,
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.adminLearningCircleService.updateLearningCircleContentFileById(
          contentFileDto,
          learningCircleId,
        ),
      );
    } catch (error) {
      console.log('patchLearningCircleById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Patch(':learningCircleId/video')
  async updateVideoFileById(
    @Body() videoFileDto: AdminLearningCircleUpdateVideoFileDto,
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.adminLearningCircleService.updateLearningCircleVideoFileById(
          videoFileDto,
          learningCircleId,
        ),
      );
    } catch (error) {
      console.log('patch updateVideoFileById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Patch(':learningCircleId/thumbnail')
  async updateThumbnailFileById(
    @Body() thumbnailFileDto: AdminLearningCircleUpdateThumbnailFileDto,
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.adminLearningCircleService.updateLearningCircleThumbnailFileById(
          thumbnailFileDto,
          learningCircleId,
        ),
      );
    } catch (error) {
      console.log('patch updateThumbnailFileById', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Delete(':learningCircleId')
  async deleteLearningCircleById(
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      await this.adminLearningCircleService.deleteLearningCircleItemById(
        learningCircleId,
      );
      return new ResponseHelper('deleted successfully');
    } catch (error) {
      console.log('deleteLearningCircleById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Delete(':learningCircleId/contentFile')
  async deleteContentFileById(
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      await this.adminLearningCircleService.deleteLearningCircleContentFileById(
        learningCircleId,
      );
      return new ResponseHelper('removed contentFile successfully');
    } catch (error) {
      console.log('deleteContentFileById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Delete(':learningCircleId/videoFile')
  async deleteVideoFileById(
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      await this.adminLearningCircleService.deleteLearningCircleVideoFileById(
        learningCircleId,
      );
      return new ResponseHelper('removed video successfully');
    } catch (error) {
      console.log('deleteVideoFileById', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @Delete(':learningCircleId/videoThumbnailFile')
  async deleteVideoThumbnailFileById(
    @Param(
      'learningCircleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    learningCircleId: number,
  ) {
    try {
      await this.adminLearningCircleService.deleteLearningCircleVideoThumbnailFileById(
        learningCircleId,
      );
      return new ResponseHelper('removed thumbnail successfully');
    } catch (error) {
      console.log('deleteThumbnailFileById', error);
      throw error;
    }
  }
}
