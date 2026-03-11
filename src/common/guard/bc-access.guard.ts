import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMetaData } from '../entities/user-metadata.entity';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from '../exceptions/permission.exception';

@Injectable()
export class BCAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const Invoice_Header_ID = request.body.Invoice_Header_ID;

    if (!Invoice_Header_ID) {
      throw new BadRequestException('Invoice_Header_ID is required');
    }

    const userMetaData = await this.userMetaDataRepository.findOneBy({
      userId: request.user.id,
    });

    const isDomestic = userMetaData.metaData.isDomestic;

    if (!isDomestic) {
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    }

    if (
      !Array.isArray(userMetaData?.pgMetaData) ||
      userMetaData.pgMetaData.length === 0
    ) {
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    }

    const userPGMetaDataByInvoiceHeaderId = userMetaData.pgMetaData.find(
      (meta) => meta.Invoice_Header_ID === Number(Invoice_Header_ID),
    );

    if (!userPGMetaDataByInvoiceHeaderId) {
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    }

    return true;
  }
}
