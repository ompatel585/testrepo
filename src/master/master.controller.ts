import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpStatus,
  Query,
  Req,
  Post,
  Body,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { MasterService } from './master.service';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { CityQueryDto } from './dto/city-query.dto';
import { AddBookDto } from './dto/add-book.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCourseCategoryDto } from './dto/create-coursecategory.dto';
import { CreateEventStatusDto } from './dto/create-eventstatus.dto';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { Repository } from 'typeorm';
import { ComplaintCategoryDto } from './dto/complaintCategory.dto';
import { User } from 'src/common/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintDto } from './dto/complaint.dto';
import { Brand } from 'src/common/entities/brand.entity';
import * as constant from '../common/constants';
import { studentSupportRequestTemplate } from 'src/email/templates/support.template';
import { EmailService } from 'src/email/email.service';
import { CourseService } from 'src/course/course.service';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { AddBookAptrack2Dto } from './dto/add-book-aptrack2.dto';
import { UpdateBookSubBrandDto } from './dto/update-book-subBrandKey.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';

@Controller('master')
export class MasterController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,

    private courseService: CourseService,
    private emailService: EmailService,
    private readonly masterService: MasterService,
  ) {}

  @Get('categories')
  async getAllCategories() {
    try {
      return new ResponseHelper(await this.masterService.getAllCategories());
    } catch (error) {
      console.log('getAllCategories', error);
      throw error;
    }
  }

  @Get('skill-category')
  async getAllSkillCategories() {
    try {
      return new ResponseHelper(await this.masterService.getAllSkillCategories());
    } catch (error) {
      console.log('getAllSkillCategories', error);
      throw error;
    }
  }

  @Get('brand')
  async getAllBrands() {
    try {
      return new ResponseHelper(await this.masterService.getAllBrands());
    } catch (error) {
      console.log('getAllBrands', error);
      throw error;
    }
  }
  @Get('jobTypes')
  async getJobType() {
    try {
      return new ResponseHelper(await this.masterService.getAllJobTypes());
    } catch (error) {
      console.log('getAllJobTypes', error);
      throw error;
    }
  }

  @Get('jobTitle')
  async getJobTitles() {
    try {
      return new ResponseHelper(await this.masterService.getAllJobTitles());
    } catch (error) {
      console.log('getAllJobTitles', error);
      throw error;
    }
  }

  @Get('companyType')
  async getCompanyType() {
    try {
      return new ResponseHelper(await this.masterService.getAllCompanyTypes());
    } catch (error) {
      console.log('getAllCompanyTypes', error);
      throw error;
    }
  }

  @Get('companyCategory')
  async getCompanyCategory() {
    try {
      return new ResponseHelper(await this.masterService.getAllCompanyCategory());
    } catch (error) {
      console.log('getAllCompanyCategory', error);
      throw error;
    }
  }

  @Get('cities')
  async getCityList(name: string, @Query() queryDto: CityQueryDto) {
    try {
      const searchKeys = ['name'];
      return new ResponseHelper(
        await this.masterService.getCityList(queryDto, searchKeys),
      );
    } catch (error) {
      console.log('getCityList', error);
      throw error;
    }
  }

  @Get('zone')
  async getZoneForBrand(
    @Req() req: Request,
    @Query(
      'brandId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    brandId: number,
  ) {
    try {
      return new ResponseHelper(await this.masterService.getZoneForBrand(brandId));
    } catch (error) {
      console.log('getZoneForBrand', error);
      throw error;
    }
  }

  @Get('region')
  async getRegionForBrandZone(
    @Req() req: Request,
    @Query(
      'brandId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    brandId: number,
    @Query('zone') zone: string,
  ) {
    try {
      return new ResponseHelper(
        await this.masterService.getRegionForBrandZone(brandId, zone),
      );
    } catch (error) {
      console.log('getRegionForBrandZone', error);
      throw error;
    }
  }

  @Get('area')
  async getAreaForBrandZoneRegion(
    @Req() req: Request,
    @Query(
      'brandId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    brandId: number,
    @Query('zone') zone: string,
    @Query('region') region: string,
  ) {
    try {
      return new ResponseHelper(
        await this.masterService.getAreaForBrandZoneRegion(brandId, zone, region),
      );
    } catch (error) {
      console.log('getRegionForBrandZone', error);
      throw error;
    }
  }

  @Get('centres')
  async getCentreForBrandZoneRegionArea(
    @Req() req: Request,
    @Query(
      'brandId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    brandId: number,
    @Query('zone') zone: string,
    @Query('region') region: string,
    @Query('area') area: string,
  ) {
    try {
      return new ResponseHelper(
        await this.masterService.getCentreForBrandZoneRegionArea(
          brandId,
          zone,
          region,
          area,
        ),
      );
    } catch (error) {
      console.log('getRegionForBrandZone', error);
      throw error;
    }
  }

  @Get('comments')
  async getMasterComments(@Req() req: any) {
    try {
      const comments = await this.masterService.getMasterComments();
      return new ResponseHelper(comments);
    } catch (error) {
      console.log('MasterController->master comments', error);
      throw error;
    }
  }

  @Get('/learning-circle-types')
  async getLearningCircleType(@Req() req: any) {
    try {
      const learningCircleTypes = await this.masterService.getLearningCircleTypes();

      return new ResponseHelper(learningCircleTypes, learningCircleTypes.length);
    } catch (error) {
      console.log('MasterController->master learning-circle-type', error);
      throw error;
    }
  }

  @Get('brand/:brandId/taxonomy-brand/taxonomy-brand-category')
  async getTaxonomyCategoriesByTaxonomyBrandId(
    @Req() req: Request,
    @Param(
      'brandId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    brandId: number,
  ) {
    try {
      const { taxonomyCategories } =
        await this.masterService.getTaxonomyCategoriesByBrandId(brandId);
      return new ResponseHelper(taxonomyCategories, taxonomyCategories.length);
    } catch (error) {
      console.log('getLearningCircleDetail', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Post('book')
  async addBook(@Body() addBookDto: AddBookDto) {
    try {
      await this.masterService.addBook(addBookDto);
      return new ResponseHelper('book created successfully');
    } catch (error) {
      console.log('master/addBook', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Post('book/aptrack2')
  async addAptrack2Book(@Body() addBookDto: AddBookAptrack2Dto) {
    try {
      await this.masterService.addBook(addBookDto);
      return new ResponseHelper('book created successfully');
    } catch (error) {
      console.log('master/addAptrack2Book', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Patch('book/:aptrack_1_book_id')
  async updateBook(
    @Body() updateBookDto: UpdateBookDto,
    @Param(
      'aptrack_1_book_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    aptrack_1_book_id: number,
  ) {
    try {
      await this.masterService.updateBook(aptrack_1_book_id, updateBookDto);
      return new ResponseHelper('book updated successfully');
    } catch (error) {
      console.log('master/updateBook', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Patch('book/:aptrack_2_book_id/aptrack2')
  async updateAptrack2Book(
    @Body() updateBookDto: UpdateBookDto,
    @Param(
      'aptrack_2_book_id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    aptrack_2_book_id: number,
  ) {
    try {
      await this.masterService.updateAptrack2Book(aptrack_2_book_id, updateBookDto);
      return new ResponseHelper('book updated successfully');
    } catch (error) {
      console.log('master/updateAptrack2Book', error);
      throw error;
    }
  }

  @Get('payment-option')
  async getPaymentOption(@Req() req: any) {
    try {
      const data = await this.masterService.getAllPaymentOption();
      return new ResponseHelper(data);
    } catch (error) {
      console.log('masterController->getPaymentOption', error);
      throw error;
    }
  }

  @Post('brand')
  async createBrand(@Body(new ValidationPipe()) createBrandDto: CreateBrandDto) {
    try {
      const data = await this.masterService.createBrand(createBrandDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.error('createBrand error:', error);
      throw error;
    }
  }

  @Get('brand/:id')
  async getBrand(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const brand = await this.masterService.getBrandById(id);
      return new ResponseHelper(brand);
    } catch (error) {
      console.error('MasterController->getBrand', error);
      throw error;
    }
  }

  @Post('event-status')
  async createEventStatus(
    @Body(new ValidationPipe()) createEventStatusDto: CreateEventStatusDto,
  ) {
    try {
      const data = await this.masterService.createEventStatus(createEventStatusDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.error('MasterController->createEventStatus', error);
      throw error;
    }
  }

  @Get('event-status/:id')
  async getEventStatuses(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const statuses = await this.masterService.getEventStatuses(id);
      return new ResponseHelper(statuses);
    } catch (error) {
      console.error('MasterController->getEventStatuses', error);
      throw error;
    }
  }

  @Post('course-category')
  async createCourseCategory(
    @Body(new ValidationPipe()) createCourseCategoryDto: CreateCourseCategoryDto,
  ) {
    try {
      const data = await this.masterService.createCourseCategory(createCourseCategoryDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.error('MasterController->createCourseCategory', error);
      throw error;
    }
  }

  @Get('course-category/:id')
  async getCourseCategory(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const category = await this.masterService.getCourseCategory(id);
      return new ResponseHelper(category);
    } catch (error) {
      console.error('MasterController->getCourseCategory', error);
      throw error;
    }
  }

  @Get('brand/:brandId/sub-brand')
  async getSubBrandList(
    @Req() req: Request,
    @Param(
      'brandId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    brandId: number,
  ) {
    try {
      return new ResponseHelper(await this.masterService.getSubBrandList(brandId));
    } catch (error) {
      console.log('getLearningCircleDetail', error);
      throw error;
    }
  }

  @Post('complaint-category')
  @TransformQuery(ComplaintCategoryDto)
  async addComplaintCategory(
    @DefaultUser() user: DefaultUserResponse,
    @Body() body: ComplaintCategoryDto,
  ) {
    try {
      const userId = Number(user.id);

      const newCopmplaintCategory = new ComplaintCategoryDto();
      newCopmplaintCategory.category = body.category;
      newCopmplaintCategory.type = body.type;
      newCopmplaintCategory.userId = userId;

      const data = await this.masterService.addComplaintCategory(newCopmplaintCategory);
      return new ResponseHelper(data);
    } catch (error) {
      console.error('MasterController->addSkillCategory', error);
      throw error;
    }
  }

  @Get('complaint-category')
  async getComplaintCategory(
    @Query('type')
    type: string,
  ) {
    try {
      const { item } = await this.masterService.getComplaintCategory(type);
      return new ResponseHelper(item);
    } catch (error) {
      console.log('getLearningCircleDetail', error);
      throw error;
    }
  }

  @Post('register-complaint')
  async registerComplaint(@DefaultUser() user: DefaultUserResponse, @Body() body: any) {
    try {
      const userId = user.id;

      const userData = await this.userRepository.findOne({
        where: { id: userId },
        relations: {
          profile: true,
          userRole: {
            brand: true,
          },
        },
      });

      if (!user) {
        throw new NotFoundException('user not found!');
      }

      const newCopmplaint = new ComplaintDto();
      newCopmplaint.complaintDescription = body.description;
      newCopmplaint.complaintType = body.type;
      newCopmplaint.complaintCategoryId = body.categoryId;
      newCopmplaint.isResolved = 0;
      newCopmplaint.userArea = userData.userRole[0].area;
      newCopmplaint.userBrand = userData.userRole[0].brand.name;
      newCopmplaint.userCenter = userData.userRole[0].centreName;
      newCopmplaint.userEmail = userData.profile.email;
      newCopmplaint.userMobile = userData.profile.mobile;
      newCopmplaint.userName = userData.name;
      newCopmplaint.userId = userData.id;
      newCopmplaint.userRegion = userData.userRole[0].region;
      newCopmplaint.userZone = userData.userRole[0].zone;

      const data = await this.masterService.registerComplaint(newCopmplaint);
      if (data) {
        const complaintCategoryDetails =
          await this.masterService.getComplaintCategoryById(
            newCopmplaint.complaintCategoryId,
          );

        const userCourses = await this.courseService.getMapCourses(user);
        const cousersName = userCourses.map((c) => c.name).join(', ');

        let email = process.env.PROCONNECT_SUPPORT_EMAIL;
        if (body.category == 'CC') {
          email = process.env.CUSTOMER_CARE_EMAIL;
        }

        const msg = {
          to: email,
          from: constant.PROCONNECT_SUPPORT_EMAIL,
          subject: 'Support Request!',
          html: studentSupportRequestTemplate({
            userName: newCopmplaint.userName,
            userMobile: newCopmplaint.userMobile,
            userEmail: newCopmplaint.userEmail,
            userId: user.userId.replace(/student/gi, ''),
            userCourses: cousersName,
            complaintCategory: complaintCategoryDetails.category,
            userBrand: newCopmplaint.userBrand.toUpperCase(),
            userZone: newCopmplaint.userZone,
            userRegion: newCopmplaint.userRegion,
            userArea: newCopmplaint.userArea,
            userCenter: newCopmplaint.userCenter,
            complaintDescription: newCopmplaint.complaintDescription,
          }),
        };
        await this.emailService.sendEmail(msg);
      }

      return new ResponseHelper(data);
    } catch (error) {
      console.error('MasterController->addSkillCategory', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Patch('aptrack1/book/sub-brand-keys')
  async updateAptrack1BookSubBrandKeys(@Body() dto: UpdateBookSubBrandDto) {
    try {
      await this.masterService.updateAptrack1BookSubBrandKeys(dto);
      return new ResponseHelper('successfully updated books sub-brand ids');
    } catch (error) {
      console.log('master/updateAptrack1BookSubBrandKeys', error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Patch('aptrack2/book/sub-brand-keys')
  async updateAptrack2BookSubBrandKeys(@Body() dto: UpdateBookSubBrandDto) {
    try {
      await this.masterService.updateAptrack2BookSubBrandKeys(dto);
      return new ResponseHelper('successfully updated books sub-brand ids');
    } catch (error) {
      console.log('master/updateAptrack2BookSubBrandKeys', error);
      throw error;
    }
  }
}
