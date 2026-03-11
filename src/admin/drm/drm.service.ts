import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateDrmDto } from './dto/create-drm.dto';
import { UpdateDrmDto } from './dto/update-drm.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import FormData from 'form-data';
import * as crypto from 'crypto';
import { GenerateDrmLinkDto } from './dto/generate-drm-link.dto';
import { UploadDrmDto } from './dto/upload-drm.dto';
import { S3_DRM_BOOKS } from 'src/common/constants';
import { generateUniqueFileName } from 'src/common/helper/file.helper';
import { DrmQueryDto } from './dto/drm-query.dto';
import { In, Repository } from 'typeorm';
import { Drm } from 'src/common/entities/drm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import {
  addOrReplaceBook,
  generateDownloadLink,
} from 'src/common/external-services/e-shabda/e-shabda-endpoints';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { Buffer } from 'buffer';
import { DrmDownload } from 'src/common/entities/drmDownload.entity';
import { CreateDrmDownloadDto } from './dto/create-drm-download.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { UpdateDrmDownloadStatus } from './dto/update-drm-download-status.dto';
import { OrderBy } from '@aws-sdk/client-cloudwatch-logs';

enum DrmAddOrReplaceEnum {
  Add = 'add',
  Update = 'update',
}

@Injectable()
export class DrmService {
  private readonly logger = new Logger(DrmService.name);

  constructor(
    private fileUploadService: FileUploadService,
    private cloudLoggerService: CloudLoggerService,
    @InjectRepository(Drm)
    private drmRepository: Repository<Drm>,
    @InjectRepository(DrmDownload)
    private drmDownloadRepository: Repository<DrmDownload>,
    private readonly configService: ConfigService,
  ) {}

  private generateDrmHash(nonce: number, email: string, sharedSecret: string) {
    return crypto
      .createHmac('sha1', Buffer.from(sharedSecret, 'base64'))
      .update(`${nonce}${email}`)
      .digest('hex');
  }

  private async prepareDrmAddOrReplaceData(
    type: DrmAddOrReplaceEnum,
    data: CreateDrmDto | UpdateDrmDto,
    resourceId: string = '',
  ) {
    const nonce = Math.floor(Math.random() * (999999999 - 1000000) + 1000000);
    const email = process.env.E_SHABDA_EMAIL;
    const sharedSecret = process.env.E_SHABDA_SHARED_SECRECT;
    const distributorId = process.env.E_SHABDA_DISTRIBUTOR_ID;
    const title = data.title;
    const author = data.author;
    const publisher = data.publisher;
    const allowCopy = !!data.allowCopy;
    const allowPrint = !!data.allowPrint;
    const hash = this.generateDrmHash(nonce, email, sharedSecret);
    const s3Stream = await this.fileUploadService.streamFileFromS3(data.filePath);
    let op = 'add';
    if (DrmAddOrReplaceEnum.Update == type) {
      op = 'replace';
    }
    // for addFormData
    const form = new FormData();
    form.append('file', s3Stream, {
      filename: 'abc.pdf', // Optional, but often required by some servers
      contentType: 'application/pdf',
    });
    form.append('nonce', nonce);
    form.append('email', email);
    form.append('hash', hash);
    form.append('title', title);
    form.append('author', author);
    form.append('allowCopy', String(allowCopy));
    form.append('allowPrint', String(allowPrint));
    form.append('publisher', publisher);
    form.append('operation', op);
    form.append('distributorId', distributorId);
    if (resourceId) form.append('bookResourceId', resourceId);
    return form;
  }

  async create(createDrmDto: CreateDrmDto) {
    for (const file of createDrmDto.files) {
      createDrmDto.title = file.title;
      createDrmDto.fileName = file.fileName;
      createDrmDto.filePath = file.filePath;

      let drm = this.drmRepository.create({
        ...createDrmDto,
      });

      drm = await this.drmRepository.save(drm);

      const form = await this.prepareDrmAddOrReplaceData(
        DrmAddOrReplaceEnum.Add,
        createDrmDto,
      );

      try {
        const response = await addOrReplaceBook(form);

        if (response?.data?.result?.status == 'Success') {
          drm.status = 1;
          drm.resourceId = response?.data?.result?.resource;

          drm = await this.drmRepository.save(drm);
        } else {
          this.cloudLoggerService.error(
            `Failed to add file to e-shabda DRM response:`,
            `${JSON.stringify(response.data)}`,
          );
          this.logger.error(
            `Failed to add file to e-shabda DRM response: ${JSON.stringify(response.data)}`,
          );
        }
      } catch (error) {
        this.cloudLoggerService.error(
          `Failed to add file to e-shabda DRM`,
          error.toString(),
        );

        this.logger.error(`Failed to add file to e-shabda DRM: ${error.toString()}`);
      }
    }

    return 'success';
  }

  async generateDrmLink(
    generateDrmLinkDto: GenerateDrmLinkDto,
    createDrmDownloadDto: CreateDrmDownloadDto,
  ) {
    // TODO currently stop this validation due to data issue from OV side
    /* const drm = await this.drmRepository.findOneBy({
      resourceId: generateDrmLinkDto.resourceId,
    });

    if (!drm) {
      throw new NotFoundException(`drm not found`);
    } */

    const email = process.env.E_SHABDA_EMAIL;
    const sharedSecret = process.env.E_SHABDA_SHARED_SECRECT;
    const distributorId = process.env.E_SHABDA_DISTRIBUTOR_ID;
    const format = 'JSON';
    const resourceId = generateDrmLinkDto.resourceId;

    // Generate values
    const nonce = Math.floor(Math.random() * (999999999 - 1000000) + 1000000);
    const transactionId = Math.floor(Date.now() / 1000); // Unix timestamp
    const hash = this.generateDrmHash(nonce, email, sharedSecret);
    createDrmDownloadDto.transaction = transactionId;

    // Prepare data
    const data = {
      nonce,
      email,
      hash,
      operation: 'add',
      format,
      distributorId,
      resourceId,
      name: 'Onlinevarsity',
      transactionId,
    };

    try {
      const response = await generateDownloadLink(data);
      if (response?.data?.result?.status == 'Success') {
        this.addDrmDownloadTransaction(createDrmDownloadDto);
        return response.data.result.downloadLink;
      }

      this.cloudLoggerService.error(
        `Failed to generate link to e-shabda DRM response:`,
        `${JSON.stringify(response.data)}`,
      );
      this.logger.error(
        `Failed to generate link to e-shabda DRM response: ${JSON.stringify(response.data)}`,
      );
    } catch (error) {
      this.cloudLoggerService.error(
        `Failed to generate link to e-shabda DRM`,
        error.toString(),
      );

      this.logger.error(`Failed to generate link to e-shabda DRM: ${error.toString()}`);
    }

    throw new ServiceUnavailableException('failed to generate link');
  }

  async upload(uploadDrmDto: UploadDrmDto) {
    const s3Key = `${S3_DRM_BOOKS}/${generateUniqueFileName(uploadDrmDto.fileName)}`;
    const presignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);

    return { fileName: uploadDrmDto.fileName, ...presignedUrl };
  }

  async listDrm(queryParams: DrmQueryDto, searchKeys?: string[]) {
    const query = this.drmRepository.createQueryBuilder('drm');
    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: query,
      filters: queryParams.filter,
      searchKeys: searchKeys,
    });

    const [records, count] = await queryBuilder.getManyAndCount();

    return { drmBooks: records, count };
  }

  async showDrm(drmId: number) {
    const drm = await this.drmRepository.findOneBy({ id: drmId });

    if (!drm) throw new NotFoundException('drm not exits');

    return drm;
  }

  async update(drmId: number, updateDrmDto: UpdateDrmDto) {
    let drm = await this.drmRepository.findOneBy({ id: drmId });
    if (!drm) {
      throw new NotFoundException('drm not found');
    }
    if (updateDrmDto.filePath == drm.filePath) {
      return await this.drmRepository.save({
        ...drm,
        ...updateDrmDto,
      });
    }
    let form = null;
    if (drm.resourceId) {
      form = await this.prepareDrmAddOrReplaceData(
        DrmAddOrReplaceEnum.Update,
        updateDrmDto,
        drm.resourceId,
      );
    } else {
      form = await this.prepareDrmAddOrReplaceData(DrmAddOrReplaceEnum.Add, updateDrmDto);
    }
    try {
      const response = await addOrReplaceBook(form);
      if (response?.data?.result?.status == 'Success') {
        drm.status = 1;
        drm.resourceId = response?.data?.result?.resource;
        drm = await this.drmRepository.save({
          ...drm,
          ...updateDrmDto,
          status: 1,
          resourceId: response?.data?.result?.resource,
        });
      } else {
        drm = await this.drmRepository.save({
          ...drm,
          ...updateDrmDto,
          status: 0,
        });
        this.cloudLoggerService.error(
          `Failed to replace file to e-shabda DRM response:`,
          `${JSON.stringify(response.data)}`,
        );
        this.logger.error(
          `Failed to replace file to e-shabda DRM response: ${JSON.stringify(response.data)}`,
        );
      }
    } catch (error) {
      this.cloudLoggerService.error(
        `Failed to replace file to e-shabda DRM`,
        error.toString(),
      );
      this.logger.error(`Failed to replace file to e-shabda DRM: ${error.toString()}`);
    }
    return drm;
  }

  async removeDrm(drmId: number) {
    await this.drmRepository.delete(drmId);
  }

  async findByResourceIds(drmResourceIdArray: string[]) {
    const drmArray = await this.drmRepository.find({
      where: {
        resourceId: In(drmResourceIdArray),
      },
    });

    return drmArray;
  }

  async addDrmDownloadTransaction(createDrmDownloadDto: CreateDrmDownloadDto) {
    const errors = await validate(createDrmDownloadDto);

    if (errors.length > 0) {
      this.logger.error(
        `error in addDrmDownloadTransaction => ${JSON.stringify(createDrmDownloadDto)}`,
        errors,
      );
      this.cloudLoggerService.error(
        `error in addDrmDownloadTransaction =>`,
        errors.toString() + JSON.stringify(createDrmDownloadDto),
        1,
      );
      return null;
    }

    let drmDownload = await this.drmDownloadRepository.findOne({
      where: {
        userId: createDrmDownloadDto.userId,
        courseModuleId: createDrmDownloadDto.courseModuleId,
        resourceId: createDrmDownloadDto.resourceId,
      },
      order: { id: 'DESC' },
    });

    if (drmDownload) {
      //  incremental update
      if (drmDownload.downloadCount != 6) {
        let condition = {};

        if (drmDownload.downloadCount == 1) {
          condition = { downloadCount: 2, twoDownload: createDrmDownloadDto.transaction };
        }
        if (drmDownload.downloadCount == 2) {
          condition = {
            downloadCount: 3,
            threeDownload: createDrmDownloadDto.transaction,
          };
        }
        if (drmDownload.downloadCount == 3) {
          condition = {
            downloadCount: 4,
            fourDownload: createDrmDownloadDto.transaction,
          };
        }
        if (drmDownload.downloadCount == 4) {
          condition = {
            downloadCount: 5,
            fiveDownload: createDrmDownloadDto.transaction,
          };
        }
        if (drmDownload.downloadCount == 5) {
          condition = { downloadCount: 6, sixDownload: createDrmDownloadDto.transaction };
        }

        return await this.drmDownloadRepository.update({ id: drmDownload.id }, condition);
      }
    }
    // create new

    drmDownload = this.drmDownloadRepository.create({
      ...createDrmDownloadDto,
      oneDownload: createDrmDownloadDto.transaction,
    });

    return await this.drmDownloadRepository.save(drmDownload);
  }

  // will required for manual allow after 6
  /* async canDownloadDrmFile(userId: number, courseModuleId: number, resourceId: string) {
    const drmDownload = await this.drmDownloadRepository.findOne({
      where: {
        userId: createDrmDownloadDto.userId,
        courseModuleId: createDrmDownloadDto.courseModuleId,
        resourceId: createDrmDownloadDto.resourceId,
      },
      order: { id: 'DESC' },
    });

    if (drmDownload.count == 6) return false;

    return true;
  } */

  // will required for manual allow after 6
  /* async updateDrmDownload(id: number, updateDrmDownloadStatus: UpdateDrmDownloadStatus) {
    return await this.drmDownloadRepository.update(
      { id },
      { ...updateDrmDownloadStatus },
    );
  } */
}
