import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from 'src/common/entities/portfolio.entity';
import { User } from 'src/common/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Work } from 'src/common/entities/work.entity';
import { S3_PORTFOLIO } from 'src/common/constants';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UpdatePortfolioThumbnailDto } from './dto/update-portfolio-thumbnail.dto';
import {
  UserPortfolioFilterDto,
  UserPortfolioQueryDto,
} from './dto/user-portfolio-filter.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { PORTFOLIO_MESSAGES } from '../common/json/error-messages.json';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,

    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Function validates work ids
   * @param {number[]} workIds workids are array of work ids to be added in the new portfolio
   * @returns {Promise<boolean>} return a boolean if provided work ids are valid
   */
  private async validateWorkIds(
    workIds: number[],
    user: DefaultUserResponse,
  ): Promise<void> {
    const works = await this.workRepository.findBy({ id: In(workIds), userId: user.id });
    const isValid = works.length === workIds.length;
    if (!isValid) {
      throw new BadRequestException('Invalid work IDs');
    }
  }

  async create(tokenUser: DefaultUserResponse, createPortfolioDto: CreatePortfolioDto) {
    const exisitngPortfolio = await this.portfolioRepository.findOneBy({
      userId: tokenUser.id,
    });
    if (exisitngPortfolio) {
      throw new BusinessException(PORTFOLIO_MESSAGES.PORTFOLIO_ALREADY_EXISTS);
    }

    // Validate project IDs
    if (createPortfolioDto.workIds) {
      await this.validateWorkIds(createPortfolioDto.workIds, tokenUser);
    }

    const user = new User({ id: tokenUser.id });
    let portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
      user,
    });

    portfolio = await this.portfolioRepository.save(portfolio);

    const s3ThumbnailKey = `${S3_PORTFOLIO}/${portfolio.id}/${createPortfolioDto.thumbnail}`;

    const thumbnailPresignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3ThumbnailKey);
    portfolio.thumbnail = s3ThumbnailKey;
    portfolio = await this.portfolioRepository.save(portfolio);

    return { portfolio, thumbnailPresignedUrl };
  }

  async update(
    user: DefaultUserResponse,
    updateDto: UpdatePortfolioDto,
    portfolioId: number,
  ) {
    let portfolio = await this.portfolioRepository.findOneBy({
      userId: user.id,
      id: portfolioId,
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found!');
    }

    // Validate project IDs before update
    if (updateDto.workIds) {
      await this.validateWorkIds(updateDto.workIds, user);
    }
    let thumbnailPresignedUrl: { url: string; presignedURLKey: string };

    if (updateDto.thumbnail) {
      const s3ThumbnailKey = `${S3_PORTFOLIO}/${portfolio.id}/${updateDto.thumbnail}`;

      thumbnailPresignedUrl =
        await this.fileUploadService.generatePutObjectPresignedUrl(s3ThumbnailKey);

      updateDto.thumbnail = s3ThumbnailKey;
    }

    portfolio = await this.portfolioRepository.save({
      ...portfolio,
      ...updateDto,
    });

    return { portfolio, thumbnailPresignedUrl };
  }

  async updateThumbnail(
    portfolioId: number,
    user: DefaultUserResponse,
    updateThumbnailDto: UpdatePortfolioThumbnailDto,
  ) {
    let portfolio = await this.portfolioRepository.findOneBy({
      userId: user.id,
      id: portfolioId,
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found!');
    }

    const s3ThumbnailKey = `${S3_PORTFOLIO}/${portfolio.id}/${updateThumbnailDto.thumbnail}`;

    const thumbnailPresignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3ThumbnailKey);

    portfolio.thumbnail = s3ThumbnailKey;
    portfolio = await this.portfolioRepository.save(portfolio);

    return { portfolio, thumbnailPresignedUrl };
  }

  async findAll(queryParams: UserPortfolioQueryDto, searchKeys?: string[]) {
    const queryBuilderInstance = this.portfolioRepository.createQueryBuilder('portfolio');
    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      searchKeys: searchKeys,
    });

    const [portfolios, count] = await queryBuilder.getManyAndCount();

    const presignedUrlPromises = [];

    for (const portfolio of portfolios) {
      // Adding presigned URL for thumbnail
      if (portfolio.thumbnail) {
        const thumbnailUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(portfolio.thumbnail)
          .then((url) => {
            portfolio.thumbnail = url;
          });
        presignedUrlPromises.push(thumbnailUrlPromise);
      }
    }

    await Promise.all(presignedUrlPromises);
    return { portfolios, count };
  }

  async find(portfolioId: number) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) throw new NotFoundException();

    portfolio.thumbnail = await this.fileUploadService.generateGetObjectPresignedUrl(
      portfolio.thumbnail,
    );
    return portfolio;
  }

  async delete({
    user,
    portfolioId,
  }: {
    user: DefaultUserResponse;
    portfolioId: number;
  }) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId, userId: user.id },
    });

    if (!portfolio) throw new NotFoundException();

    await this.portfolioRepository.delete(portfolioId);
    // also remove thumbnail from S3
    await this.fileUploadService.deleteFileFromS3(portfolio.thumbnail);

    return portfolio;
  }
}
