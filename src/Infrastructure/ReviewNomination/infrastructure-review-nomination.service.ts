import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { InfrastructureReviewNomination } from '../../common/entities/infrastructure-review-nomination.entity';
import { Brand } from '../../common/entities/brand.entity';
import { Centre } from '../../common/entities/centre.entity';
import { InfrastructureReviewTemplate } from '../../common/entities/infrastructure-review-template.entity';

import { CreateReviewNominationDto } from './dto/create-review-nomination.dto';

import { ReviewNominationStatus } from '../../common/entities/infrastructure-review-nomination.entity';




@Injectable()
export class InfrastructureReviewNominationService {

  constructor(
    @InjectRepository(InfrastructureReviewNomination)
    private readonly repo: Repository<InfrastructureReviewNomination>,

    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,

    @InjectRepository(Centre)
    private readonly centreRepo: Repository<Centre>,

    @InjectRepository(InfrastructureReviewTemplate)
    private readonly templateRepo: Repository<InfrastructureReviewTemplate>,
  ) {}

  async create(dto: CreateReviewNominationDto) {

    const brand = await this.brandRepo.findOne({ where: { id: dto.brandId } });
    if (!brand) throw new NotFoundException(`Brand ${dto.brandId} not found`);

    const centre = await this.centreRepo.findOne({ where: { id: dto.centerId } });
    if (!centre) throw new NotFoundException(`Center ${dto.centerId} not found`);

    const template = await this.templateRepo.findOne({
      where: { id: dto.templateId },
    });
    if (!template) throw new NotFoundException(`Template ${dto.templateId} not found`);

    const entity = this.repo.create(dto);

    const saved = await this.repo.save(entity);

    return {
      message: 'Review nomination created',
      data: saved,
    };
  }

  async findAll(startDate?: string, endDate?: string) {

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const rows = await this.repo.find({
      where,
      relations: ['brand', 'center', 'template'],
    });

    return rows;
  }

  async findByBrand(id: number) {

    return this.repo.find({
      where: { brandId: id },
      relations: ['brand', 'center', 'template'],
    });
  }

  async findOne(id: number) {

    const row = await this.repo.findOne({
      where: { id },
      relations: ['brand', 'center', 'template'],
    });

    if (!row) throw new NotFoundException('Nomination not found');

    return row;
  }

  async update(dto: CreateReviewNominationDto) {

    const existing = await this.repo.findOne({
      where: {
        brandId: dto.brandId,
        centerId: dto.centerId,
        templateId: dto.templateId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Nomination not found');
    }

    Object.assign(existing, dto);

    return this.repo.save(existing);
  }

  async submit(dto: CreateReviewNominationDto) {

  const entity = this.repo.create({
    ...dto,
    status: ReviewNominationStatus.PENDING,
  });

  return this.repo.save(entity);
}
}