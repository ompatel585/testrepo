import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import {
  getFacultyProfileMetaDataAptrack2RedisKey,
  getFacultyProfileMetaDataRedisKey,
  getStudentMetaDataAptrack2RedisKey,
  getStudentMetaDataRedisKey,
} from 'src/cache/redis-keys';
import {
  IAptrack2EmployeeMetaData,
  IAptrackEmployeeMetaData,
  IStudentMetaData,
} from 'src/common/entities/user-metadata.entity';
import * as constant from '../common/constants';
import {
  checkFacultyExitsWithPass,
  checkFacultyExitsWithPassFromAptrack2,
  getAptrackEmployeeProfileDetails,
  getAptrackEmployeeProfileDetailsFromAptrack2,
  getStudentDetails,
  getStudentDetailsFromAptrack2,
} from 'src/common/external-services/aptrack-one/endpoints';
import { handleAxiosError } from 'src/common/helper/error.helper';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { getAeBrandId, getCeBrandId } from 'src/common/helper/role.helper';
import { MasterService } from 'src/master/master.service';
import {
  AptrackProconnectIntegratedRoles,
  AptrackRole,
} from 'src/common/enum/aptrack-role.enum';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/entities/userRole.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from './users.service';

@Injectable()
export class AptrackUserService {
  private readonly logger = new Logger(AptrackUserService.name);

  constructor(
    private readonly redisCache: RedisCacheService,
    private cloudLoggerService: CloudLoggerService,
    private readonly masterService: MasterService,
    private readonly userService: UsersService,

    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAptrack1StudentFromRedisOrApi(studentId: string) {
    const studentMetaDataAptrack1RedisKey = getStudentMetaDataRedisKey(studentId);

    let studentMetaData: IStudentMetaData = null;

    // redis
    const studentRedisData: IStudentMetaData | IStudentMetaData[] =
      await this.redisCache.get(studentMetaDataAptrack1RedisKey);

    const studentNormalizeRedisData = Array.isArray(studentRedisData)
      ? (studentRedisData[0] ?? null)
      : studentRedisData;

    if (studentNormalizeRedisData) {
      studentMetaData = studentNormalizeRedisData;
    } else {
      // api
      try {
        const studentApiData = await getStudentDetails(studentId, 'ALL');

        studentMetaData = Array.isArray(studentApiData)
          ? (studentApiData[0] ?? null)
          : studentApiData;
      } catch (error) {
        handleAxiosError(
          `in getAptrack1StudentFromRedisOrApi => ${studentId}`,
          error,
          (message, data) => this.cloudLoggerService.error(message, data),
        );
      }
    }

    if (!studentMetaData) {
      return null;
    }

    if (constant.getAptrack2BrandIdList().includes(parseInt(studentMetaData.brandId))) {
      return null;
    }

    return studentMetaData;
  }

  async getAptrack2StudentFromRedisOrApi(studentId: string) {
    const studentMetaDataAptrack2RedisKey = getStudentMetaDataAptrack2RedisKey(studentId);

    let studentMetaData: IStudentMetaData = null;

    // redis
    const studentRedisData: IStudentMetaData | IStudentMetaData[] =
      await this.redisCache.get(studentMetaDataAptrack2RedisKey);

    const studentNormalizeRedisData = Array.isArray(studentRedisData)
      ? (studentRedisData[0] ?? null)
      : studentRedisData;

    if (studentNormalizeRedisData) {
      studentMetaData = studentNormalizeRedisData;
    } else {
      // api
      try {
        const studentApiData = await getStudentDetailsFromAptrack2(studentId, 'ALL');

        studentMetaData = Array.isArray(studentApiData)
          ? (studentApiData[0] ?? null)
          : studentApiData;
      } catch (error) {
        handleAxiosError(
          `in getAptrack2StudentFromRedisOrApi => ${studentId}`,
          error,
          (message, data) => this.cloudLoggerService.error(message, data),
        );
      }
    }

    if (!studentMetaData) {
      return null;
    }

    if (!constant.getAptrack2BrandIdList().includes(parseInt(studentMetaData.brandId))) {
      return null;
    }

    return studentMetaData;
  }

  isValidBC(studentData: IStudentMetaData, bc: string) {
    const bcArray = studentData.BC.map((item) => item.BCNo);
    if (!bcArray.includes(bc)) {
      return false;
    }

    return true;
  }

  async updateRedisWithStudentMetaData(studentData: IStudentMetaData) {
    const studentMetaDataAptrack1RedisKey = getStudentMetaDataRedisKey(
      studentData.userId,
    );
    const studentMetaDataAptrack2RedisKey = getStudentMetaDataAptrack2RedisKey(
      studentData.userId,
    );

    if (constant.getAptrack2BrandIdList().includes(parseInt(studentData.brandId))) {
      await this.redisCache.set(studentMetaDataAptrack2RedisKey, studentData);
    } else {
      await this.redisCache.set(studentMetaDataAptrack1RedisKey, studentData);
    }
  }

  async getAptrack1FacultyFromApi(userId, pass, hasPass: boolean = true) {
    // AE login only for aptrack 2
    if (hasPass == false) {
      return null;
    }
    try {
      const faculty = await checkFacultyExitsWithPass(userId, pass);
      // const faculty = await getAptrackEmployeeProfileDetails({ username: userId });

      if (!faculty) return null;

      const brandId = getCeBrandId(faculty.brandIds);

      return constant.getAptrack2BrandIdList().includes(brandId) ? null : faculty;
    } catch (error) {
      handleAxiosError(
        `in getAptrack1FacultyFromApi => ${userId}`,
        error,
        (message, data) => this.cloudLoggerService.error(message, data),
      );
      return null;
    }
  }

  async getAptrack2FacultyFromApi(userId, pass, hasPass: boolean = true) {
    try {
      const faculty = hasPass
        ? await checkFacultyExitsWithPassFromAptrack2(userId, pass)
        : await getAptrackEmployeeProfileDetailsFromAptrack2(userId);
      // const faculty = hasPass
      //   ? await getAptrackEmployeeProfileDetailsFromAptrack2(userId)
      //   : await getAptrackEmployeeProfileDetailsFromAptrack2(userId);

      if (!faculty) return null;

      const brandId =
        faculty.userType == 'CE'
          ? getCeBrandId(faculty.brandIds)
          : getAeBrandId(faculty.TopAccess);

      return constant.getAptrack2BrandIdList().includes(brandId) ? faculty : null;
    } catch (error) {
      handleAxiosError(
        `in getAptrack2FacultyFromApi => ${userId}`,
        error,
        (message, data) => this.cloudLoggerService.error(message, data),
      );
      return null;
    }
  }

  async updateRedisWithAptrackEmployeeMetaData(faculty: IAptrack2EmployeeMetaData) {
    const brandId =
      faculty.userType == 'CE'
        ? getCeBrandId(faculty.brandIds)
        : getAeBrandId(faculty.TopAccess);

    if (constant.getAptrack2BrandIdList().includes(brandId)) {
      const facultyMetaDataRedisKey2 = getFacultyProfileMetaDataAptrack2RedisKey(
        faculty.userId,
      );
      await this.redisCache.set(facultyMetaDataRedisKey2, faculty);
    } else {
      const facultyMetaDataRedisKey1 = getFacultyProfileMetaDataRedisKey(faculty.userId);
      await this.redisCache.set(facultyMetaDataRedisKey1, faculty);
    }
  }

  async handleNewRolesForCE(user: User, faculty: IAptrack2EmployeeMetaData) {
    // check new roles
    const comingRoles = [];
    for (const brand of faculty.brandIds) {
      const proconnectBrand = await this.masterService.getBrandByKey(brand.BrandId);

      if (proconnectBrand) {
        for (const role of brand.RoleCentre) {
          if (Object.values(AptrackRole).includes(role.Role as AptrackRole)) {
            comingRoles.push({
              user: user,
              brandId: proconnectBrand.id,
              role: AptrackProconnectIntegratedRoles[role.Role],
              centreIds: role.CentreDetails.map((c) => c.CentreId),
              subBrandIds: [],
            });
          }
        }
      }
    }

    // remove expiredRoles
    const expiredRoles = user.userRole.filter(
      (dbRole) =>
        !comingRoles.some(
          (comingRole) =>
            comingRole.brandId === dbRole.brandId && comingRole.role === dbRole.role,
        ),
    );

    if (expiredRoles.length > 0) {
      const ids = expiredRoles.map((r) => r.id);
      await this.userRoleRepository.delete({ id: In(ids) });

      // fetch user again with new roles
      user = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.userId)=:userId', { userId: user.userId })
        .leftJoinAndSelect('user.userRole', 'userRole')
        .leftJoinAndSelect('userRole.brand', 'brand')
        .getOne();
    }

    const newRoles = comingRoles.filter(
      (comingRole) =>
        !user.userRole.some(
          (userRole) =>
            userRole.brandId === comingRole.brandId && userRole.role === comingRole.role,
        ),
    );

    // add new roles
    if (newRoles.length > 0) {
      const roleEntities = this.userRoleRepository.create(newRoles);

      await this.userRoleRepository.save(roleEntities);

      // fetch user again with new roles
      user = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.userId)=:userId', { userId: user.userId })
        .leftJoinAndSelect('user.userRole', 'userRole')
        .leftJoinAndSelect('userRole.brand', 'brand')
        .getOne();
    }

    // CE details update
    const updatePromises = [];

    if (faculty) {
      updatePromises.push(
        this.userService.addUpdateUserMetaData(user.id, faculty),
        this.userService.updateUserDetailsWithMetaData(user.id, faculty),
      );
    }
    await Promise.all(updatePromises);

    return user;
  }

  async handleNewRolesForAE(user: User, faculty: IAptrack2EmployeeMetaData) {
    // check new roles
    const comingRoles = [];
    for (const brand of faculty.TopAccess) {
      const proconnectBrand = await this.masterService.getBrandByKey(brand.BrandId);

      if (proconnectBrand) {
        for (const role of brand.RoleAcess) {
          if (Object.values(AptrackRole).includes(role.Role as AptrackRole)) {
            comingRoles.push({
              user: user,
              brandId: proconnectBrand.id,
              role: AptrackProconnectIntegratedRoles[role.Role],
              hierarchy: role.AcessDetails,
              subBrandIds: [],
            });
          }
        }
      }
    }

    const expiredRoles = user.userRole.filter(
      (dbRole) =>
        !comingRoles.some(
          (comingRole) =>
            comingRole.brandId === dbRole.brandId && comingRole.role === dbRole.role,
        ),
    );

    // remove expiredRoles
    if (expiredRoles.length > 0) {
      const ids = expiredRoles.map((r) => r.id);
      await this.userRoleRepository.delete({ id: In(ids) });

      // fetch user again with new roles
      user = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.userId)=:userId', { userId: user.userId })
        .leftJoinAndSelect('user.userRole', 'userRole')
        .leftJoinAndSelect('userRole.brand', 'brand')
        .getOne();
    }

    const newRoles = comingRoles.filter(
      (comingRole) =>
        !user.userRole.some(
          (userRole) =>
            userRole.brandId === comingRole.brandId && userRole.role === comingRole.role,
        ),
    );

    // add new roles
    if (newRoles.length > 0) {
      const roleEntities = this.userRoleRepository.create(newRoles);
      await this.userRoleRepository.save(roleEntities);

      // fetch user again with new roles
      user = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.userId)=:userId', { userId: user.userId })
        .leftJoinAndSelect('user.userRole', 'userRole')
        .leftJoinAndSelect('userRole.brand', 'brand')
        .getOne();
    }

    // AE details update
    const updatePromises = [];

    if (faculty) {
      updatePromises.push(
        this.userService.addUpdateUserMetaData(user.id, faculty),
        this.userService.updateUserDetailsWithMetaData(user.id, faculty),
      );
    }
    await Promise.all(updatePromises);

    return user;
  }
}
