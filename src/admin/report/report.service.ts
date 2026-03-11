import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DrmDownload } from 'src/common/entities/drmDownload.entity';
import { Repository } from 'typeorm';
import { DrmDownloadQueryDto } from './dto/drm-download-qeury.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { transformFilterKeysWithTableContext } from 'src/common/helper/transformFilterKeysWithTableContext.helper';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(DrmDownload)
    private drmDownloadRepository: Repository<DrmDownload>,
  ) {}

  async drmDownload(queryParams: DrmDownloadQueryDto, searchKeys?: string[]) {
    const query = this.drmDownloadRepository.createQueryBuilder('drm_download');

    const filterMappings = {
      userId: 'user.userId',
    };

    queryParams.filter = transformFilterKeysWithTableContext(queryParams, filterMappings);

    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: query,
      filters: queryParams.filter,
      searchKeys: searchKeys,
      between: queryParams.between,
    });

    queryBuilder.leftJoin('drm_download.user', 'user');
    queryBuilder.leftJoin('drm_download.courseModule', 'course_module');

    queryBuilder
      .select('drm_download')
      .addSelect('user.userId', 'user_userId')
      .addSelect('course_module.name', 'course_module_name')
      .addSelect('course_module.aptrack_1_book_id')
      .addSelect('course_module.aptrack_2_book_id');

    const [records, count] = await queryBuilder.getManyAndCount();

    return { records, count };
  }
}
