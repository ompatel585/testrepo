import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { Follow } from 'src/common/entities/follow.entity';
import { User } from 'src/common/entities/user.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { Repository } from 'typeorm';
import { FollowQueryDto } from './dto/follow-query.dto';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async followUser(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new Error("Users can't follow themselves");
    }

    const follower = await this.userRepository.findOneBy({ id: followerId });
    const following = await this.userRepository.findOneBy({ id: followingId });

    if (!follower || !following) {
      throw new Error('User not found');
    }

    const existingFollow = await this.followRepository.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      throw new BusinessException('Already follow');
    }

    let follow = this.followRepository.create({ follower, following });
    await this.followRepository.save(follow);
  }

  async unFollowUser(followerId: number, followingId: number): Promise<void> {
    await this.followRepository.delete({
      follower: { id: followerId },
      following: { id: followingId },
    });
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followers = await this.followRepository.find({
      where: { following: { id: userId } },
      relations: { follower: true },
    });
    return followers.map((follow) => follow.follower);
  }

  async getFollowing(queryParams: FollowQueryDto, searchKeys?: string[]) {
    const baseQuery = this.followRepository.createQueryBuilder('follow');
    const baseQueryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: baseQuery,
      filters: queryParams.filter,
      searchKeys: searchKeys,
      hasMore: true,
    });

    baseQueryBuilder.innerJoinAndSelect('follow.following', 'user');

    const records = await baseQueryBuilder.getMany();
    const nextPage = queryParams.limit != -1 ? records.length > queryParams.limit : false;
    let following = nextPage ? records.slice(0, -1) : records;

    return { following, nextPage };
  }
}
