import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Request,
  Patch,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ProconnectCenterEmployeeTypeRolesArray, Role } from 'src/common/enum/role.enum';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { FacultyUserQueryDto } from './dto/faculty-user.dto';
import { UserWorkFilterDto, UserWorkQueryDto } from 'src/work/dto/user-work-filter.dto';
import { WorkService } from 'src/work/work.service';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import {
  UserPortfolioFilterDto,
  UserPortfolioQueryDto,
} from 'src/portfolio/dto/user-portfolio-filter.dto';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { SaveTokenDto } from './dto/token-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { PasswordDto } from './dto/update-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateJudgeDto } from './dto/create-judge.dto';
import { DataSource, Repository } from 'typeorm';
import { runInTransaction } from 'src/common/helper/transaction.helper';
import { FetchRoleBasedDetailsDto } from './dto/fetch-role-based-details.dto';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { CreateDigitalAuditorDto } from './dto/create-digital-auditor.dto';
import { PermissionErrorMessagesEnum } from 'src/common/exceptions/permission.exception';
import { UpdateAptrackUserDetailsDto } from './dto/update-aptrack-user-details.dto';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { getUserActiveRoleRedisKey } from 'src/cache/redis-keys';
import { brandRoleFormat } from 'src/common/helper/role.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';

// import { AuthJwtGuard } from 'src/common/guard/auth-jwt.guard'; // Route level AuthJwtGuard

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private workService: WorkService,
    private configService: ConfigService,
    private portfolioService: PortfolioService,
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // @UseGuards(AuthJwtGuard) // Route level AuthJwtGuard

  @Roles(Role.Org)
  @Post('student')
  async createStudent(
    @Body(new ValidationPipe()) createStudentDto: CreateStudentDto,
    @Request() req,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.usersService.createStudent(createStudentDto, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('createStudent', error);
      throw error;
    }
  }

  @Roles(Role.Org)
  @Post('admin')
  async createAdmin(
    @Body(new ValidationPipe()) createAdminDto: CreateAdminDto,
    @Request() req,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.usersService.createAdmin(createAdminDto, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('createAdmin', error);
      throw error;
    }
  }

  @Roles(Role.Org, Role.Admin)
  @Post('moderator')
  async createModerator(
    @Body(new ValidationPipe()) createAdminDto: CreateModeratorDto,
    @Request() req,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.usersService.createModerator(createAdminDto, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('createModerator', error);
      throw error;
    }
  }

  @Roles(Role.Org, Role.Admin)
  @Post('digital-auditor')
  async createDigitalAuditor(
    @Body(new ValidationPipe()) createDigitalAuditorDto: CreateDigitalAuditorDto,
    @Request() req,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.usersService.createDigitalAuditor(
          createDigitalAuditorDto,
          manager,
        );
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('createDigitalAuditor', error);
      throw error;
    }
  }

  @Roles(Role.Org, Role.Admin)
  @Post('judge')
  async createJudge(
    @Body(new ValidationPipe()) createJudgeDto: CreateJudgeDto,
    @Request() req,
  ) {
    try {
      const data = await this.usersService.createJudge(createJudgeDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('createJudge', error);
      throw error;
    }
  }

  @Roles(Role.Org, Role.Admin)
  @Post('faculty')
  async createFaculty(
    @Body(new ValidationPipe()) createFacultyDto: CreateFacultyDto,
    @Request() req,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.usersService.createFaculty(createFacultyDto, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('createFaculty', error);
      throw error;
    }
  }

  @Roles(Role.Org)
  @Patch('reset-user-password')
  async resetUserPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const data = await this.usersService.resetUserPassword(resetPasswordDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('resetUserPassword', error);
      throw error;
    }
  }

  // Public Route
  @Public()
  @Get('public')
  getPublic() {
    throw new ServiceUnavailableException('failed to generate link');
    console.log(process.env.DB_DATABASE);
    console.log(this.configService.get('DB_DATABASE'));
    const data = 'this is a public route';
    return new ResponseHelper(data);
  }

  @Roles(Role.Admin)
  @Get('all')
  async getAllUsers(@Request() req) {
    const data = await this.usersService.findAll();
    return new ResponseHelper(data);
  }

  @Get('faculty')
  @TransformQuery(FacultyUserQueryDto)
  async getFaculty(
    @DefaultUser() user: DefaultUserResponse,
    @Query()
    queryDto: FacultyUserQueryDto,
  ) {
    try {
      const userData = await this.usersService.findUserById(user.id);
      queryDto.filter.brandId = user.activeRole.brandId;
      queryDto.filter.centreIds = userData.userRole[0].centreId;

      const searchKeys = ['name'];

      const { faculties, count } = await this.usersService.findAllFaculty(
        queryDto,
        searchKeys,
      );
      return new ResponseHelper(faculties, count);
    } catch (error) {
      console.log('getTeachers', error);
      throw error;
    }
  }

  @Get(':id/work')
  @TransformQuery(UserWorkQueryDto)
  async workByUserId(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    userId: number,
    @Query() queryDto: UserWorkQueryDto,
  ) {
    try {
      const student = await this.usersService.findUserById(userId);

      // throw error if viewers brand doesn't matches with student's
      if (
        !student.userRole.some(
          (userRoleVal) => userRoleVal.brandId == user.activeRole.brandId,
        )
      ) {
        throw new BusinessException();
      }

      if (!queryDto.filter) {
        queryDto.filter = new UserWorkFilterDto();
      }
      queryDto.filter.userId = userId;
      queryDto.filter.status = WorkStatus.Approved;
      queryDto.filter.visibility = 1;
      const searchKeys = [];
      const { works, nextPage } = await this.workService.myWork(
        user,
        queryDto,
        searchKeys,
      );
      return new ResponseHelper(works, 0, { nextPage });
    } catch (error) {
      console.log('UserController->workByUserId', error);
      throw error;
    }
  }

  @Get(':id/portfolio')
  @TransformQuery(UserPortfolioQueryDto)
  async portfolioByUserId(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    userId: number,
    @Query() queryDto: UserPortfolioQueryDto,
  ) {
    try {
      const student = await this.usersService.findUserById(userId);
      if (
        !student.userRole.some((userRole) => userRole.brandId === user.activeRole.brandId)
      ) {
        throw new BusinessException();
      }

      const searchKeys = [];
      if (!queryDto.filter) {
        queryDto.filter = new UserPortfolioFilterDto();
      }

      queryDto.filter.userId = userId;
      const { portfolios, count } = await this.portfolioService.findAll(
        queryDto,
        searchKeys,
      );
      return new ResponseHelper(portfolios, count);
    } catch (error) {
      console.log('UserController->portfolioByUserId', error);
      throw error;
    }
  }

  @Patch('save-token')
  async editProfile(
    @DefaultUser() user: DefaultUserResponse,
    @Body() saveToken: SaveTokenDto,
  ) {
    try {
      await this.usersService.saveToken(user, saveToken);
      const data = 'token saved successful';
      return new ResponseHelper(data);
    } catch (error) {
      console.log('in error of notification-token: ' + error);
      throw error;
    }
  }

  @Roles(Role.Service)
  @Get(':userKey/data')
  async userDataByUserKey(
    @Param('userKey')
    userKey: string,
  ) {
    try {
      return new ResponseHelper(await this.usersService.userDataByUserKey(userKey));
    } catch (error) {
      console.log('userController->userDataByUserKey: ' + error);
      throw error;
    }
  }

  @Patch('terms-condition')
  async updateTermsAndConditionFlag(@DefaultUser() user: DefaultUserResponse) {
    try {
      await this.usersService.updateTermsAndConditionFlag(user);
      //update the message or create a constant
      return new ResponseHelper('terms and condition accepted successfully');
    } catch (error) {
      console.log('userController->updateTermsAndConditionFlag: ' + error);
      throw error;
    }
  }

  @Post('select-role')
  async fetchAptrackDataOnRoleSelect(
    // @Req() req: any,
    @DefaultUser() user: DefaultUserResponse,
    @Body() roleDto: FetchRoleBasedDetailsDto,
  ) {
    try {
      const updatePromises = [];

      const userData = await this.userRepository.findOne({
        where: { id: user.id },
        relations: {
          userRole: { brand: true },
        },
      });

      const roles = brandRoleFormat(userData.userRole);

      const hasMatchingRole = roles.some(
        (role) => role.role == roleDto.role && role.brandId == roleDto.brandId,
      );

      if (!hasMatchingRole) {
        throw new BusinessException(PermissionErrorMessagesEnum.INSUFFICIENT_ROLE);
      }

      if (ProconnectCenterEmployeeTypeRolesArray.includes(roleDto.role)) {
        updatePromises.push(
          this.usersService.fetchAndUpdateCenterEmployeeMetaData(user, roleDto),
        );
      }

      updatePromises.push(this.usersService.updateSelectedRole(user, roleDto));

      await Promise.all(updatePromises);

      return new ResponseHelper('role selected successfully!');
    } catch (error) {
      console.log('userController->fetchAptrackDataOnRoleSelect:' + error);
      throw error;
    }
  }

  // // @Roles(Role.SuperAdmin)
  // @Patch('/random-password')
  // async updatePasswordOfUsers(@Body() data: PasswordDto) {
  //   console.log('data', data);
  //   await this.usersService.updateAllUsersRandomPasswords(data.excludeUsers, data?.center);
  // }

  // // @Roles(Role.SuperAdmin)
  // @Public()
  // @Patch('/encrypt-password')
  // async encryptPasswordOfUsers(@Body() data: PasswordDto) {
  //   await this.usersService.encryptAllPasswords(data.excludeUsers, data?.center);
  // }

  @Roles(Role.Service)
  @Patch('details')
  async updateAptrackUserDetails(
    @Body()
    updateAptrackUserDetails: UpdateAptrackUserDetailsDto,
  ) {
    try {
      await this.usersService.updateAptrackUserDetails(updateAptrackUserDetails);
      return new ResponseHelper('update successfully');
    } catch (error) {
      console.error('userController->updateAptrackUserDetails: ', error);
      throw error;
    }
  }
}
