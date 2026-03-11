import { Controller, Get, Query, Req } from '@nestjs/common';
import { HomePageService } from './homepage.service';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { AssetFilterDto, AssetQueryDto } from './dto/assets-query.dto';

@Controller('homepage')
export class HomePageController {
  constructor(private readonly homePageService: HomePageService) {}

  @Get('assets')
  async getAssets(@Req() req: any, @Query() queryDto: AssetQueryDto) {
    try {
      if (!queryDto.filter) {
        queryDto.filter = new AssetFilterDto();
      }
      queryDto.filter.brandId = req.user.brandId;
      queryDto.limit = -1;
      const data = await this.homePageService.getAssets(queryDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->myWork', error);
      throw error;
    }
  }
}
