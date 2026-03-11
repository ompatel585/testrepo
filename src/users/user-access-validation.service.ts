import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceAccess } from 'src/common/entities/service-access.entity';
import { UserSession } from 'src/common/entities/userSession.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserAccessValidationService {
  constructor(
    @InjectRepository(ServiceAccess)
    private serviceAccessRepository: Repository<ServiceAccess>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) {}

  async isServiceTokenValid(serviceId: number, token: string): Promise<boolean> {
    return !!(await this.serviceAccessRepository.findOneBy({ id: serviceId, token }));
  }

  async isUserTokenValid(userId: number, jti: string): Promise<boolean> {
    return !!(await this.userSessionRepository.findOneBy({
      userId: userId,
      sessionId: jti,
    }));
  }

  async isRefreshTokenValid(userId: number, jti: string): Promise<boolean> {
    return !!(await this.userSessionRepository.findOneBy({
      userId: userId,
      sessionId: jti,
    }));
  }
}
