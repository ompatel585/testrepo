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
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { AdminLearningCircleService } from 'src/admin/learning-circle/admin-learningCircle.service';
import { LearningCircleQueryDto } from './dto/learningCircle-filter.dto';
import { MasterService } from 'src/master/master.service';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('learning-circle')
export class LearningCircleController {
  constructor(
    private readonly adminLearningCircleService: AdminLearningCircleService,
    private readonly masterService: MasterService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @TransformQuery(LearningCircleQueryDto)
  async getLearningCircles(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: LearningCircleQueryDto,
  ) {
    try {
      const searchKeys = ['title'];

      const userData = await this.usersService.findUserById(user.id);
      if (queryDto) {
        if (queryDto.subBrandId) {
          // to validate access
          await this.adminLearningCircleService.validateSubBrandId(
            user.activeRole,
            queryDto.subBrandId,
          );

          const taxonomyBrand = await this.masterService.getTaxonomyBrandByBrandId(
            queryDto.subBrandId,
            userData.isDomestic,
          );
          queryDto.filter.taxonomyBrandId = taxonomyBrand.id;
        } else {
          const taxonomyBrand = await this.masterService.getTaxonomyBrandByBrandId(
            user.activeRole.brandId,
            userData.isDomestic,
          );
          queryDto.filter.taxonomyBrandId = taxonomyBrand.id;
        }
      }

      const { learningCircles, count } =
        await this.adminLearningCircleService.getLearningCircleData(queryDto, searchKeys);
      return new ResponseHelper(learningCircles, count);
    } catch (error) {
      console.log('getLearningCircles', error);
      throw error;
    }
  }

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
      console.log('getLearningCircleDetail', error);
      throw error;
    }
  }
}
