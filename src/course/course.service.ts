import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { AddThumbnailDto } from './dto/add-thumbnail.dto';
import { getAptrack2BrandIdList, S3_MODULE } from 'src/common/constants';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from 'src/common/exceptions/permission.exception';
import { CourseModule } from 'src/common/entities/courseModule.entity';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import {
  ProconnectAptrackEmployeeTypeRolesArray,
  ProconnectCenterEmployeeTypeRolesArray,
  Role,
} from 'src/common/enum/role.enum';
import { isAptrackEmployeeMetaData, isStudentMetaData } from 'src/common/types/guard';
import {
  IBooksMetaDataMap,
  IEmployeeBooksMetaDataMap,
} from 'src/common/interfaces/userMetaData.interface';
import {
  booksMetaDataMap,
  coursesMetaDataMap,
  employeeBooksMetaDataMap,
} from 'src/common/helper/userMetaData.helper';
import { FetchEmployeeBookDto } from './dto/fetch-employee-book';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { GenerateDrmLinkDto } from 'src/admin/drm/dto/generate-drm-link.dto';
import { DrmService } from 'src/admin/drm/drm.service';
import axios from 'axios';
import { MasterService } from 'src/master/master.service';
import { UsersService } from 'src/users/users.service';
import { CreateDrmDownloadDto } from 'src/admin/drm/dto/create-drm-download.dto';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { UserRole } from 'src/common/entities/userRole.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseModule)
    private moduleRepository: Repository<CourseModule>,
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,
    private readonly dataSource: DataSource,
    @InjectRepository(CourseModule)
    private courseModuleRepository: Repository<CourseModule>,
    private drmService: DrmService,
    private masterService: MasterService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  private checkDrmBookExitsInResource(data, resourceId) {
    for (const section of data) {
      for (const resource of section.resources) {
        if (resource.type === 'drmBook' && resource.value === resourceId) {
          return true;
        }
      }
    }

    return false;
  }

  async getMapCourses(user: DefaultUserResponse) {
    const userMetaData = await this.userService.fetchStudentMetaDataFromRedisOrDB(user);

    if (!userMetaData) return [];

    return coursesMetaDataMap(userMetaData);
  }

  private async addBookThumbnailCDNUrlPromise(book: any): Promise<void> {
    const bookFetch = await this.moduleRepository.findOneBy({ id: book.id });
    if (bookFetch) {
      book.thumbnail = bookFetch.thumbnail;
    }
  }

  async getStudentMappedBooks(user: DefaultUserResponse) {
    const userMetaData = await this.userService.fetchStudentMetaDataFromRedisOrDB(user);

    if (!userMetaData) return [];

    // set of aptrack01BookIds
    const aptrack01BookIds = new Set<number>();

    for (const BC of userMetaData.BC) {
      for (const course of BC.Courses) {
        for (const term of course.Terms) {
          for (const module of term.Modules) {
            for (const book of module.Books) {
              aptrack01BookIds.add(book.BookId);
            }
          }
        }
      }
    }

    const matchedBookIds = await this.getMatchedBookIds(user, aptrack01BookIds);

    // Needs check this logic with sunny
    // map of aptrack01bookId and courseModuleId
    const bookIdMap = new Map<number, number>();
    for (const item of matchedBookIds) {
      bookIdMap.set(item.aptrack_1_book_id, item.id);
    }

    let booksMetaData: IBooksMetaDataMap[] = [];

    booksMetaData = booksMetaDataMap(userMetaData, bookIdMap);

    const fetchThumbnailGeneratePresignedUrlPromises: Promise<void>[] = [];

    for (const course of booksMetaData) {
      for (const term of course.terms) {
        for (const book of term.books) {
          const promise = this.addBookThumbnailCDNUrlPromise(book);
          fetchThumbnailGeneratePresignedUrlPromises.push(promise);
        }
      }
    }

    await Promise.all(fetchThumbnailGeneratePresignedUrlPromises);

    return booksMetaData;
  }

  async getEmployeeMappedBooks(
    user: DefaultUserResponse,
    queryDto: FetchEmployeeBookDto,
  ): Promise<{ books: IEmployeeBooksMetaDataMap[]; count: number }> {
    const { search, limit, page } = queryDto;

    const offset = (page - 1) * limit;

    const query = `
    WITH filtered_user_books AS (
      SELECT book
      FROM user_meta_data,
           jsonb_array_elements("metaData"->'Books') AS book
      WHERE "userId" = $1
        AND (
          $2::text IS NULL
          OR book->>'BookName' ILIKE '%' || $2 || '%'
          OR (book->>'BookId')::text ILIKE '%' || $2 || '%'
        )
    )
    SELECT
      $1 AS "userId",
      (SELECT COUNT(*) FROM filtered_user_books) AS total,
      COALESCE(
        (SELECT jsonb_agg(book)
         FROM (
           SELECT book FROM filtered_user_books
           ORDER BY book->>'BookId'
           LIMIT $3 OFFSET $4
         ) as paginated_books
        ),
        '[]'::jsonb
      ) AS "Books"
    LIMIT 1;
  `;

    const results = await this.dataSource.query(query, [
      user.id,
      search || null,
      limit,
      offset,
    ]);

    const [metaData] = results;
    const totalCount = metaData?.total;

    if (!metaData) return { books: [], count: 0 };

    // set of aptrack01BookIds
    const aptrack01BookIds = new Set<number>();

    for (const book of metaData.Books) {
      aptrack01BookIds.add(book.BookId);
    }

    // fetch proconnect book ids from aptrack01BookIds
    const matchedBookIds = await this.getMatchedBookIds(user, aptrack01BookIds);

    // map of aptrack01bookId and courseModuleId
    const bookIdMap = new Map<number, number>();
    for (const item of matchedBookIds) {
      bookIdMap.set(item.aptrack_1_book_id, item.id);
    }

    let books: IEmployeeBooksMetaDataMap[] = [];
    books = employeeBooksMetaDataMap(metaData, bookIdMap);

    const fetchThumbnailGeneratePresignedUrlPromises: Promise<void>[] = [];

    for (const book of books) {
      const promise = this.addBookThumbnailCDNUrlPromise(book);
      fetchThumbnailGeneratePresignedUrlPromises.push(promise);
    }

    await Promise.all(fetchThumbnailGeneratePresignedUrlPromises);

    return { books, count: parseInt(totalCount) || books.length };
  }

  async getModuleDetails(user: DefaultUserResponse, moduleId: number) {
    let module = await this.moduleRepository.findOne({
      where: { id: moduleId, isActive: 1 },
    });

    if (!module) {
      throw new BusinessException('book not found');
    }

    if (module.sections) {
      // remove trainer section for student
      if (user.activeRole.role == Role.Student) {
        module.sections = module.sections.filter((sec) => sec.isTrainerSection != true);
      }

      module.sections = module.sections.filter((sec) => sec.active == true);
    }

    return module;
  }

  async addModuleThumbnail(moduleId, addThumbnailDto: AddThumbnailDto) {
    const s3Key = `${S3_MODULE}/${moduleId}/${addThumbnailDto.fileName}`;
    // await this.moduleRepository.update(moduleId, { thumbnail: s3Key }); //TODO

    return this.fileUploadService.generatePutObjectPresignedUrl(s3Key);
  }

  async userHasAccessToBook(
    user: DefaultUserResponse,
    moduleId: number,
  ): Promise<boolean> {
    const courseModuleItem = await this.courseModuleRepository.findOneBy({
      id: moduleId,
      isActive: 1,
    });

    if (!courseModuleItem) {
      throw new NotFoundException('Book Not Found!');
    }

    // for admin
    if (user.activeRole.role === Role.Admin) {
      return true;
    }

    // for moderator and digitalAuditor
    if (
      [
        Role.Moderator,
        Role.DigitalAuditor,
        ...ProconnectAptrackEmployeeTypeRolesArray,
      ].includes(user.activeRole.role)
    ) {
      const data = await this.courseModuleRepository.findOneBy({
        id: moduleId,
      });

      const brand = await this.masterService.getBrandById(user.activeRole.brandId);

      const subBrandIds = user.activeRole.subBrandIds;

      const subBrandKey = await this.masterService.convertToBrandsKey(subBrandIds);

      if (getAptrack2BrandIdList().includes(brand.key)) {
        if (!subBrandKey.some((v) => data.aptrack2SubBrandKeys.includes(v))) {
          throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
        }
      } else {
        if (!subBrandKey.some((v) => data.aptrack1SubBrandKeys.includes(v))) {
          throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
        }
      }
    }

    const userMetaData = await this.userMetaDataRepository.findOneBy({
      userId: user.id,
    });

    // for students
    if (user.activeRole.role === Role.Student && userMetaData && userMetaData?.metaData) {
      if (isStudentMetaData(userMetaData.metaData)) {
        // set of aptrack01BookIds
        const aptrack01BookIds = new Set<number>();

        for (const BC of userMetaData.metaData.BC) {
          for (const course of BC.Courses) {
            for (const term of course.Terms) {
              for (const module of term.Modules) {
                for (const book of module.Books) {
                  aptrack01BookIds.add(book.BookId);
                }
              }
            }
          }
        }
        // fetch proconnect book ids from aptrack01BookIds
        const matchedBookIds = await this.getMatchedBookIds(user, aptrack01BookIds);

        // set of proconnect-book-id
        const bookIdSet = new Set<number>();

        for (const item of matchedBookIds) {
          bookIdSet.add(item.id);
        }

        if (!bookIdSet.has(moduleId)) {
          throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
        }
      }
    }

    // for aptrack user
    if (
      ProconnectCenterEmployeeTypeRolesArray.includes(user.activeRole.role) &&
      userMetaData &&
      userMetaData?.metaData
    ) {
      if (isAptrackEmployeeMetaData(userMetaData.metaData)) {
        // set of aptrack01BookIds
        const aptrack01BookIds = new Set<number>();

        for (const book of userMetaData.metaData.Books) {
          aptrack01BookIds.add(book.BookId);
        }

        // fetch proconnect book ids from aptrack01BookIds
        const matchedBookIds = await this.getMatchedBookIds(user, aptrack01BookIds);

        // set of proconnect-book-id
        const bookIdSet = new Set<number>();

        for (const item of matchedBookIds) {
          bookIdSet.add(item.id);
        }

        if (!bookIdSet.has(moduleId)) {
          throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
        }
      }
    }

    return true;
  }

  async generateLink(
    user: DefaultUserResponse,
    moduleId: number,
    generateDrmLinkDto: GenerateDrmLinkDto,
  ) {
    let module = await this.moduleRepository.findOne({
      where: { id: moduleId, isActive: 1 },
    });

    if (!module) {
      throw new BusinessException('book not found');
    }

    if (
      !this.checkDrmBookExitsInResource(module.sections, generateDrmLinkDto.resourceId)
    ) {
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    }

    const createDrmDownloadDto = plainToInstance(CreateDrmDownloadDto, {});
    createDrmDownloadDto.courseModuleId = moduleId;
    createDrmDownloadDto.userId = user.id;
    createDrmDownloadDto.resourceId = generateDrmLinkDto.resourceId;

    return await this.drmService.generateDrmLink(
      generateDrmLinkDto,
      createDrmDownloadDto,
    );
  }

  async generateFile(
    user: DefaultUserResponse,
    moduleId: number,
    generateDrmLinkDto: GenerateDrmLinkDto,
  ) {
    // will required for manual allow after 6
    /* const canDownloadDrmFile = await this.drmService.canDownloadDrmFile(
      user.id,
      moduleId,
      generateDrmLinkDto.resourceId,
    );
    if (!canDownloadDrmFile) {
      throw new BusinessException('max download limit reached');
    } */

    const createDrmDownloadDto = plainToInstance(CreateDrmDownloadDto, {});
    createDrmDownloadDto.courseModuleId = moduleId;
    createDrmDownloadDto.userId = user.id;
    createDrmDownloadDto.resourceId = generateDrmLinkDto.resourceId;
    const url = await this.generateLink(user, moduleId, generateDrmLinkDto);

    const response = await axios.get(url, {
      responseType: 'arraybuffer', // important for binary
    });

    return {
      data: response.data,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
    };
  }

  async getMatchedBookIds(user: DefaultUserResponse, aptrack01BookIds: Set<number>) {
    if (aptrack01BookIds.size === 0) {
      return [];
    }
    const brand = await this.masterService.getBrandById(user.activeRole.brandId);

    let query = this.courseModuleRepository.createQueryBuilder('course_module');

    // aptrack 2
    if (getAptrack2BrandIdList().includes(brand.key)) {
      query.andWhere(`course_module.aptrack_2_book_id IN (:...aptrack01BookIds)`, {
        aptrack01BookIds: [...aptrack01BookIds],
      });
      query.andWhere(`course_module.isActive = 1`);
      query.select([
        'course_module.id AS id',
        'course_module.aptrack_2_book_id AS aptrack_1_book_id',
      ]);
    }
    // aptrack 1
    else {
      query.andWhere(`course_module.aptrack_1_book_id IN (:...aptrack01BookIds)`, {
        aptrack01BookIds: [...aptrack01BookIds],
      });
      query.andWhere(`course_module.isActive = 1`);
      query.select([
        'course_module.id AS id',
        'course_module.aptrack_1_book_id AS aptrack_1_book_id',
      ]);
    }

    return await query.getRawMany();
  }
}
