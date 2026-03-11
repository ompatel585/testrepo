import { Controller, Get, Query, Req } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedExclusionDto, FeedFilterDto, FeedQueryDto } from './dto/feed-query.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { RoleBrand } from 'src/common/decorator/role-brand.decorator';
import { Role } from 'src/common/enum/role.enum';
import { Brand } from 'src/common/decorator/brands.decorator';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Brand(1, 2, 3)
  @Get()
  @TransformQuery(FeedQueryDto)
  async getFeed(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: FeedQueryDto,
  ) {
    try {
      const searchKeys = [];
      const { newWorks, nextPage } = await this.feedService.getFeed(
        user,
        queryDto,
        searchKeys,
      );

      return new ResponseHelper(newWorks, 0, { nextPage });
    } catch (error) {
      console.log('FeedController->getFeed', error);
      throw error;
    }
  }
}
