import { Controller, Get, Query, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { Public } from 'src/common/decorator/public.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { DrmDownloadQueryDto } from './dto/drm-download-qeury.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

@Roles(Role.Admin)
@Controller('admin/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('drm-download')
  @TransformQuery(DrmDownloadQueryDto)
  async drmDownload(@Req() req: any, @Query() queryDto: DrmDownloadQueryDto) {
    try {
      const { records, count } = await this.reportService.drmDownload(queryDto);

      return new ResponseHelper(records, count);
    } catch (error) {
      console.log('error in ReportController->drmDownload', error);
      throw error;
    }
  }
}
