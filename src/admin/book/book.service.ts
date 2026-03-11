import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseModule } from 'src/common/entities/courseModule.entity';
import { Repository } from 'typeorm';
import { BookQueryDto } from './dto/book-query.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { EditBookDto, ResourceTypeEnum } from './dto/edit-book.dto';
import { UploadDto } from './dto/upload.dto';
import { S3_BOOK } from 'src/common/constants';
import { generateUniqueFileName } from 'src/common/helper/file.helper';
import { AddThumbnailDto } from './dto/add-thumbnail.dto';
import { DrmService } from '../drm/drm.service';
import { BusinessException } from 'src/common/exceptions/business.exception';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(CourseModule)
    private courseModuleRepository: Repository<CourseModule>,
    private fileUploadService: FileUploadService,
    private drmService: DrmService,
  ) {}

  async findAll(queryParams: BookQueryDto, searchKeys?: string[]) {
    const query = this.courseModuleRepository.createQueryBuilder('course_module');

    const columnTypes = { aptrack1SubBrandKeys: 'array', aptrack2SubBrandKeys: 'array' };

    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: query,
      filters: queryParams.filter,
      searchKeys: searchKeys,
      columnTypes: columnTypes,
      hasMore: true,
    });

    const records = await queryBuilder.getMany();

    const nextPage = queryParams.limit != -1 ? records.length > queryParams.limit : false;
    const books = nextPage ? records.slice(0, -1) : records;

    const newBooks = books.map((book) => {
      const { sections, ...resetDetails } = book;
      return resetDetails;
    });

    return { newBooks, nextPage };
  }

  async show(bookId: number) {
    const book = await this.courseModuleRepository.findOneBy({ id: bookId, isActive: 1 });
    book.sections = book.sections.map((section) => {
      section.resources = this.temFileNameThumbnailName(section.resources);
      return section;
    });

    if (!book) throw new NotFoundException('book not exits');

    return book;
  }

  private temFileNameThumbnailName(resources: any[] = []) {
    for (const resource of resources) {
      if (resource.type == ResourceTypeEnum.SESSION) {
        this.temFileNameThumbnailName(resource.sessionValue);
      }

      if (
        (resource.type == ResourceTypeEnum.PDF ||
          resource.type == ResourceTypeEnum.DOWNLOAD ||
          resource.type == ResourceTypeEnum.AUDIO) &&
        !resource?.fileName
      ) {
        resource.fileName = resource.value.split('/').pop();
      }

      if (resource.type == ResourceTypeEnum.VIDEO) {
        if (!resource?.fileName) {
          resource.fileName = resource.value.split('/').pop();
        }

        if (resource?.thumbnail && !resource?.thumbnailName) {
          resource.thumbnailName = resource.thumbnail.split('/').pop();
        }
      }

      if (resource.type == ResourceTypeEnum.VIDEOLINK) {
        if (resource?.thumbnail && !resource?.thumbnailName) {
          resource.thumbnailName = resource.thumbnail.split('/').pop();
        }
      }
    }

    return resources;
  }

  private getDrmResourceIdArray(resources: any[] = []) {
    const drmResourceIdArray = [];
    for (const resource of resources) {
      if (resource.type == ResourceTypeEnum.SESSION) {
        drmResourceIdArray.push(...this.getDrmResourceIdArray(resource.sessionValue));
      }

      if (resource.type == ResourceTypeEnum.DRM_BOOK) {
        drmResourceIdArray.push(resource.value);
      }
    }

    return drmResourceIdArray;
  }

  private collectDrmResourceIds(sections: any[]): string[] {
    const ids: string[] = [];

    for (const section of sections) {
      ids.push(...this.getDrmResourceIdArray(section.resources));
    }

    return [...new Set(ids)];
  }

  async edit(bookId: number, editBookDto: EditBookDto) {
    let book = await this.courseModuleRepository.findOneBy({ id: bookId, isActive: 1 });

    if (!book) throw new NotFoundException('book not exits');

    // TODO currently stop this validation due to data issue from OV side
    /* const drmResourceIdArray = this.collectDrmResourceIds(editBookDto.sections);
    if (drmResourceIdArray) {
      const drmArray = await this.drmService.findByResourceIds(drmResourceIdArray);

      if (drmResourceIdArray.length != drmArray.length) {
        throw new BusinessException('Contain Invalid Drm');
      }
    } */

    return await this.courseModuleRepository.save({ ...book, ...editBookDto });
  }

  async upload(bookId: number, uploadDto: UploadDto) {
    const s3Key = `${S3_BOOK}/${bookId}/upload/${generateUniqueFileName(uploadDto.fileName)}`;
    const presignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);

    return { fileName: uploadDto.fileName, ...presignedUrl };
  }

  async addThumbnail(bookId: number, addThumbnailDto: AddThumbnailDto) {
    let book = await this.courseModuleRepository.findOneBy({ id: bookId, isActive: 1 });

    if (!book) throw new NotFoundException();

    const s3Key = `${S3_BOOK}/${bookId}/${generateUniqueFileName(addThumbnailDto.fileName)}`;
    const presignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);

    book.thumbnail = s3Key;
    await this.courseModuleRepository.save(book);

    return presignedUrl;
  }

  async deleteBook(bookId: number) {
    await this.courseModuleRepository.delete(bookId);
  }
}
