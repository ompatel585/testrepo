import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { Repository } from 'typeorm';
import { UserMetaData } from '../entities/user-metadata.entity';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from '../exceptions/permission.exception';
import { ICertificatesMetaDataMap } from '../interfaces/userMetaData.interface';
import { isStudentMetaData } from '../types/guard';
import { certificatesMetaDataMap } from '../helper/userMetaData.helper';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CertAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const certName = request.body.certName;

    const userMetaData = await this.userService.fetchStudentMetaDataFromRedisOrDB(
      request.user,
    );

    if (!userMetaData) {
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    }

    let certificates: ICertificatesMetaDataMap[] = certificatesMetaDataMap(userMetaData);

    const certNamesSet = certificates.reduce(
      (certs: Set<String>, item: ICertificatesMetaDataMap) => {
        certs.add(item.certificateName);
        certs.add(item.lapaePSName);
        for (const ps of item.terms) {
          certs.add(ps.certificateName);
        }

        return certs;
      },
      new Set<String>(),
    );

    if (!certNamesSet.has(certName)) {
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    }

    return true;
  }
}
