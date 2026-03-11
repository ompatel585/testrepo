import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomePageAssets } from 'src/common/entities/homepageAssets.entity';
import { filterQueryBuilder } from 'src/common/helper/query.helper';

import { Repository } from 'typeorm';
import { AssetQueryDto } from './dto/assets-query.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
@Injectable()
export class HomePageService {
  constructor(
    @InjectRepository(HomePageAssets)
    private homePageAssetsRepository: Repository<HomePageAssets>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getAssets(queryParams: AssetQueryDto) {
    const queryBuilderInstance =
      this.homePageAssetsRepository.createQueryBuilder('asset');

    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
    });

    const [assets, count] = await queryBuilder.getManyAndCount();
    const presignedUrlPromises = [];
    for (let assetItem of assets) {
      if (assetItem && assetItem.url) {
        const assetItemUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(assetItem.url)
          .then((url) => {
            assetItem.url = url;
          });
        presignedUrlPromises.push(assetItemUrlPromise);
      }
    }
    await Promise.all(presignedUrlPromises);

    return { assets, count };
  }
}
