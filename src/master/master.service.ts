import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Categories } from 'src/common/entities/categories.entity';
import { In, QueryBuilder, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SkillCategory } from 'src/common/entities/skillCategory.entity';
import { JobProfile } from 'src/common/entities/jobProfile.entity';
import { Brand } from 'src/common/entities/brand.entity';
import { JobType } from 'src/common/entities/jobType.entity';
import { JobTitle } from 'src/common/entities/jobTitle.entity';
import { CompanyType } from 'src/common/entities/companyType.entity';
import { CompanyCategory } from 'src/common/entities/companyCategory.entity';
import { CityQueryDto } from './dto/city-query.dto';
import { City } from 'src/common/entities/city.entity';
import { Centre } from 'src/common/entities/centre.entity';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { MasterWorkComment } from 'src/common/entities/masterWorkComment.entity';
import { LearningCircleType } from 'src/common/entities/learning-circle-type.entity';
import { AccountTypeEnum, TaxonomyBrand } from 'src/common/entities/taxonomyBrand.entity';
import { TaxonomyBrandCategory } from 'src/common/entities/taxonomyBrandCategory.entity';
import { CourseModule } from 'src/common/entities/courseModule.entity';
import { AddBookDto } from './dto/add-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { PaymentOption } from 'src/common/entities/paymentOption.entity';
import { User } from 'src/common/entities/user.entity';
import { EventStatus } from 'src/common/entities/eventStatus.entity';
import { CourseCategory } from 'src/common/entities/courseCategories.entity';
import { Event } from 'src/common/entities/event.entity';
import { CreateEventStatusDto } from './dto/create-eventstatus.dto';
import { CreateCourseCategoryDto } from './dto/create-coursecategory.dto';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { ComplaintCategoryDto } from './dto/complaintCategory.dto';
import { ComplaintCategories } from 'src/common/entities/complaintCategories.entity';
import { ComplaintDto } from './dto/complaint.dto';
import { Complaint } from 'src/common/entities/complaint.entity';
import { AddBookAptrack2Dto } from './dto/add-book-aptrack2.dto';
import { UpdateBookSubBrandDto } from './dto/update-book-subBrandKey.dto';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
    @InjectRepository(SkillCategory)
    private readonly skillCategoryRepository: Repository<SkillCategory>,
    @InjectRepository(Complaint)
    private ComplaintRepository: Repository<Complaint>,
    @InjectRepository(ComplaintCategories)
    private ComplaintCategoryRepository: Repository<ComplaintCategories>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(JobType)
    private jobTypeRepository: Repository<JobType>,
    @InjectRepository(JobTitle)
    private jobTitleRepository: Repository<JobTitle>,
    @InjectRepository(CompanyType)
    private companyTypeRepository: Repository<CompanyType>,
    @InjectRepository(CompanyCategory)
    private companyCategoryRepository: Repository<CompanyCategory>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(Centre)
    private centreRepository: Repository<Centre>,
    @InjectRepository(MasterWorkComment)
    private masterWorkCommentRepository: Repository<MasterWorkComment>,
    @InjectRepository(LearningCircleType)
    private learningCircleTypeRepository: Repository<LearningCircleType>,
    @InjectRepository(CourseModule)
    private courseModuleRepository: Repository<CourseModule>,
    @InjectRepository(TaxonomyBrand)
    private taxonomyBrandRepository: Repository<TaxonomyBrand>,
    @InjectRepository(TaxonomyBrandCategory)
    private taxonomyBrandCategoryRepository: Repository<TaxonomyBrandCategory>,
    @InjectRepository(PaymentOption)
    private paymentOptionRepository: Repository<PaymentOption>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EventCourseCategory)
    private readonly eventCategoryRepository: Repository<EventCourseCategory>,
    @InjectRepository(EventStatus)
    private readonly statusRepository: Repository<EventStatus>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getAllCategories() {
    return await this.categoriesRepository.find({});
  }

  async getMasterComments() {
    return await this.masterWorkCommentRepository.find({});
  }

  async getAllSkillCategories() {
    return await this.skillCategoryRepository.find({});
  }

  async getAllBrands() {
    return await this.brandRepository.find({});
  }
  async getAllJobTypes() {
    return await this.jobTypeRepository.find({});
  }

  async getBrandById(brandId: number) {
    return await this.brandRepository.findOneBy({ id: brandId });
  }

  async getBrandByKey(key: number) {
    return await this.brandRepository.findOneBy({ key });
  }

  async getBrandsByKey(keys: number[]) {
    return await this.brandRepository.find({
      where: {
        key: In(keys),
      },
    });
  }

  async getBrandByUserId(userId: number) {
    // return await this.brandRepository.findOneBy({ key });
    const queryBuilderInstance = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.brand', 'brand')
      .where('user.id = :userId', { userId })
      .select(['user.id', 'user.userId', 'brand.id', 'brand.code', 'brand.key']);

    return await queryBuilderInstance.getOne();
  }

  async getAllJobTitles() {
    return await this.jobTitleRepository.find({});
  }

  async getAllCompanyTypes() {
    return await this.companyTypeRepository.find({});
  }

  async getAllCompanyCategory() {
    return await this.companyCategoryRepository.find({});
  }

  async getCityList(queryParams: CityQueryDto, searchKeys?: string[]) {
    let listQuery = this.cityRepository.createQueryBuilder('city');

    listQuery = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: listQuery,
      searchKeys: searchKeys,
    });

    const [cities, count] = await listQuery.getManyAndCount();
    return {
      cities,
      count,
    };
  }

  async getZoneForBrand(brandId: number) {
    return await this.centreRepository
      .createQueryBuilder('centre')
      .select('distinct centre.zone as value, centre.zone as label ')
      .where('centre.brandId = :brandId', { brandId })
      .getRawMany();
  }

  async getRegionForBrandZone(brandId: number, zone: string) {
    return await this.centreRepository
      .createQueryBuilder('centre')
      .select('distinct centre.region as value, centre.region as label ')
      .where('centre.brandId = :brandId', { brandId })
      .andWhere('centre.zone = :zone', { zone: zone })
      .getRawMany();
  }

  async getAreaForBrandZoneRegion(brandId: number, zone: string, region: string) {
    return await this.centreRepository
      .createQueryBuilder('centre')
      .select('distinct centre.area as value, centre.area as label ')
      .where('centre.brandId = :brandId', { brandId })
      .andWhere('centre.zone = :zone', { zone: zone })
      .andWhere('centre.region = :region', { region: region })
      .getRawMany();
  }

  async getCentreForBrandZoneRegionArea(
    brandId: number,
    zone: string,
    region: string,
    area: string,
  ) {
    return await this.centreRepository
      .createQueryBuilder('centre')
      .select('distinct centre.id as value, centre.name as label ')
      .where('centre.brandId = :brandId', { brandId })
      .andWhere('centre.zone = :zone', { zone: zone })
      .andWhere('centre.region = :region', { region: region })
      .andWhere('centre.area = :area', { area: area })
      .getRawMany();
  }

  async findCentre(id: number) {
    return await this.centreRepository.findOneBy({ id: id });
  }

  async getLearningCircleTypes() {
    return await this.learningCircleTypeRepository.find({ where: { isActive: 1 } });
  }

  async getTaxonomyCategoriesByBrandId(brandId: number) {
    const taxonomyBrand = await this.getTaxonomyBrandByBrandId(brandId);
    const [taxonomyCategories, count] =
      await this.taxonomyBrandCategoryRepository.findAndCountBy({
        taxonomyBrandId: taxonomyBrand.id,
        isActive: 1,
      });
    return { taxonomyCategories, count };
  }

  async getTaxonomyBrandByBrandId(brandId: number, isDomestic: boolean = true) {
    const taxonomyBrand = await this.taxonomyBrandRepository.findOne({
      where: {
        brandId: brandId,
        accountType: isDomestic
          ? AccountTypeEnum.Domestic
          : AccountTypeEnum.International,
      },
    });

    if (!taxonomyBrand) {
      throw new NotFoundException();
    }

    return taxonomyBrand;
  }

  async addBook(addBookDto: AddBookDto | AddBookAptrack2Dto) {
    const book = this.courseModuleRepository.create({ ...addBookDto });

    return await this.courseModuleRepository.save(book);
  }

  async updateBook(aptrack_1_book_id: number, updateBookDto: UpdateBookDto) {
    const book = await this.courseModuleRepository.findOne({
      where: { aptrack_1_book_id },
    });
    if (!book) {
      throw new BusinessException('book not found');
    }

    return await this.courseModuleRepository.save({ ...book, ...updateBookDto });
  }

  async updateAptrack2Book(aptrack_2_book_id: number, updateBookDto: UpdateBookDto) {
    const book = await this.courseModuleRepository.findOne({
      where: { aptrack_2_book_id },
    });
    if (!book) {
      throw new BusinessException('book not found');
    }

    return await this.courseModuleRepository.save({ ...book, ...updateBookDto });
  }

  async getAllPaymentOption() {
    return await this.paymentOptionRepository.find({
      order: { groupLevel: 'ASC' },
      where: { status: 1 },
    });
  }

  async createBrand(dto: CreateBrandDto) {
    const created = await this.brandRepository.save(dto);
    return created;
  }

  async createEventStatus(data: CreateEventStatusDto) {
    const event = await this.eventRepository.findOneBy({ id: Number(data.eventId) });
    const eventStatus = this.statusRepository.create({
      event,
      status: data.status,
    });
    return this.statusRepository.save(eventStatus);
  }

  async createCourseCategory(data: CreateCourseCategoryDto) {
    const category = this.eventCategoryRepository.create({
      categoryName: data.categoryName,
      courseCode: data.courseCode,
    });

    return await this.eventCategoryRepository.save(category);
  }

  async getEventStatuses(id: number): Promise<string[]> {
    const statuses = await this.statusRepository.find({
      where: { event: { id } },
      relations: ['event'],
      select: ['status'],
    });

    if (!statuses || statuses.length === 0) {
      throw new NotFoundException('Status not found');
    }

    return [...new Set(statuses.map((item) => item.status))];
  }

  async getCourseCategory(id: number) {
    const category = await this.eventCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findCategoryByName(categoryName: string) {
    return this.eventCategoryRepository.findOne({ where: { categoryName } });
  }

  async getAllEventCategory() {
    return await this.eventCategoryRepository.find();
  }

  async getSubBrandList(brandId: number) {
    const brand = await this.brandRepository.findOneBy({ id: brandId });

    if (!brand) {
      throw new NotFoundException();
    }

    if (!brand.subBrandIds.length) {
      return [];
    }

    return await this.brandRepository.find({
      where: {
        id: In(brand.subBrandIds),
      },
    });
  }

  async hasMultiBrands(brandId: number) {
    const brand = await this.getBrandById(brandId);

    if (brand && brand.subBrandIds.length == 0) {
      return false;
    }

    return true;
  }

  async convertToBrandsKey(subBrandIds: number[]) {
    const brandKeys = [];
    const brands = await this.brandRepository.find({ where: { id: In(subBrandIds) } });

    for (const brand of brands) {
      brandKeys.push(brand.key);
    }

    return brandKeys;
  }

  async addComplaintCategory(complaintCategoryDto: ComplaintCategoryDto) {
    const config = await this.ComplaintCategoryRepository.findOne({
      where: { category: complaintCategoryDto.category, type: complaintCategoryDto.type },
    });

    if (config) {
      throw new ConflictException(
        `complaint category ${complaintCategoryDto.category} already exist`,
      );
    }

    const newConfig = this.ComplaintCategoryRepository.create({
      ...complaintCategoryDto,
    });
    return await this.ComplaintCategoryRepository.save(newConfig);
  }

  async getComplaintCategory(type: string) {
    const item = await this.ComplaintCategoryRepository.findBy({ type });

    if (!item) {
      throw new NotFoundException();
    }

    return { item };
  }

  async registerComplaint(complaint: ComplaintDto) {
    const registerComplaint = this.ComplaintRepository.create({
      ...complaint,
    });
    return await this.ComplaintRepository.save(registerComplaint);
  }

  async getComplaintCategoryById(complaintCategoryId: number) {
    return await this.ComplaintCategoryRepository.findOneBy({ id: complaintCategoryId });
  }

  async updateAptrack1BookSubBrandKeys(dto: UpdateBookSubBrandDto) {
    const ops = dto.bookSubBrandData.map((item) => {
      return this.courseModuleRepository.update(
        { aptrack_1_book_id: item.aptrack_book_id },
        { aptrack1SubBrandKeys: item.subBrandKeys },
      );
    });
    await Promise.all(ops);
  }

  async updateAptrack2BookSubBrandKeys(dto: UpdateBookSubBrandDto) {
    const ops = dto.bookSubBrandData.map((item) => {
      return this.courseModuleRepository.update(
        { aptrack_2_book_id: item.aptrack_book_id },
        { aptrack2SubBrandKeys: item.subBrandKeys },
      );
    });
    await Promise.all(ops);
  }
}
