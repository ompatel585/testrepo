import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { DrmService } from './drm.service';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UpdateDrmDownloadStatus } from './dto/update-drm-download-status.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';

@Roles(Role.Admin)
@Controller('admin/drm-download')
export class DrmDownloadController {
  constructor(private readonly drmService: DrmService) {}

  // will required for manual allow after 6
  /* @Patch(':id')
  async updateStatus(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body() updateDrmDownloadStatus: UpdateDrmDownloadStatus,
  ) {
    try {
      await this.drmService.updateDrmDownload(id, updateDrmDownloadStatus);

      return new ResponseHelper('update successfully');
    } catch (error) {
      console.log('DrmDownloadController->updateStatus', error);
      throw error;
    }
  } */
}
