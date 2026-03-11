import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { FollowQueryDto } from './dto/follow-query.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@Controller('users')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':followingId/follow')
  async followUser(
    @DefaultUser() user: DefaultUserResponse,
    @Param(
      'followingId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    followingId: number,
  ) {
    const followerId = user.id;
    await this.followService.followUser(followerId, followingId);
    return new ResponseHelper('User followed successfully');
  }

  @Delete(':followingId/follow')
  async unFollowUser(
    @DefaultUser() user: DefaultUserResponse,
    @Param(
      'followingId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    followingId: number,
  ) {
    const followerId = user.id;
    await this.followService.unFollowUser(followerId, followingId);
    return new ResponseHelper('User un-followed successfully');
  }

  @Get('following')
  @TransformQuery(FollowQueryDto)
  async getFollowing(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: FollowQueryDto,
  ) {
    queryDto.filter['followerId'] = user.id;
    const { following, nextPage } = await this.followService.getFollowing(queryDto);
    return new ResponseHelper(following, 0, { nextPage });
  }

  @Get('followers')
  async getFollowers(@Req() req: any) {}
}
