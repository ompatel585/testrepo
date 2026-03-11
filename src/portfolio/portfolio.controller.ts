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
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioService } from './portfolio.service';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdatePortfolioThumbnailDto } from './dto/update-portfolio-thumbnail.dto';
import {
  UserPortfolioFilterDto,
  UserPortfolioQueryDto,
} from './dto/user-portfolio-filter.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
@Roles(Role.Student)
@Controller('portfolio')
export class PortFolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @TransformQuery(UserPortfolioQueryDto)
  async getMyPortfolios(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: UserPortfolioQueryDto,
  ) {
    const searchKeys = [];
    if (!queryDto.filter) {
      queryDto.filter = new UserPortfolioFilterDto();
    }

    queryDto.filter.userId = user.id;
    const { portfolios, count } = await this.portfolioService.findAll(
      queryDto,
      searchKeys,
    );
    return new ResponseHelper(portfolios, count);
  }

  @Delete(':id')
  async deletePortfolioById(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    portfolioId: number,
  ) {
    return new ResponseHelper(
      await this.portfolioService.delete({ user: user, portfolioId: portfolioId }),
    );
  }

  @Get(':id')
  async getPortfolioById(
    @Req() req: Request,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    portfolioId: number,
  ) {
    return new ResponseHelper(await this.portfolioService.find(portfolioId));
  }

  @Post()
  async create(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) createPortfolioDto: CreatePortfolioDto,
  ) {
    try {
      return new ResponseHelper(
        await this.portfolioService.create(user, createPortfolioDto),
      );
    } catch (error) {
      console.log('PortfolioController->createPortfolio', error);
      throw error;
    }
  }

  @Patch(':id')
  async updatePotfolio(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) updatePortfolioDto: UpdatePortfolioDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    portfolioId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.portfolioService.update(user, updatePortfolioDto, portfolioId),
      );
    } catch (error) {
      console.log('PortfolioController->createPortfolio', error);
      throw error;
    }
  }

  @Patch(':id/thumbnail')
  async UpdateThumbnail(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) UpdatePortfolioThumbnailDto: UpdatePortfolioThumbnailDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    portfolioId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.portfolioService.updateThumbnail(
          portfolioId,
          user,
          UpdatePortfolioThumbnailDto,
        ),
      );
    } catch (error) {
      console.log('PortfolioController->createPortfolio', error);
      throw error;
    }
  }
}
