import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InfrastructureParameter } from '../../common/entities/infrastructure-parameter.entity';
import { InfrastructureSubParameter } from '../../common/entities/infrastructure-sub-parameter.entity';
import { InfrastructureCategory } from '../../common/entities/infrastructure-category.entity';
import { Brand } from '../../common/entities/brand.entity';

import { CreateInfrastructureParameterDto } from './dto/create-infrastructure-parameter.dto';

@Injectable()
export class InfrastructureParametersService {

  constructor(
    @InjectRepository(InfrastructureParameter)
    private readonly parameterRepo: Repository<InfrastructureParameter>,

    @InjectRepository(InfrastructureSubParameter)
    private readonly subParameterRepo: Repository<InfrastructureSubParameter>,

    @InjectRepository(InfrastructureCategory)
    private readonly categoryRepo: Repository<InfrastructureCategory>,

    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  async create(dto: CreateInfrastructureParameterDto) {

  const { brandId, categoryId, parameterName, subParameters } = dto;

  if (!categoryId) {
    throw new BadRequestException('categoryId is required');
  }

  if (!parameterName) {
    throw new BadRequestException('parameterName is required');
  }

  const existing = await this.parameterRepo.findOne({
    where: {
      brandId,
      infrastructureCategoryId: categoryId,
      infrastructureParameterName: parameterName,
    },
  });

  if (existing) {
    throw new ConflictException(`Parameter "${parameterName}" already exists`);
  }

  // ---- duplicate subParameter validation ----

  const names = subParameters.map((s) => s.name.trim().toLowerCase());

  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index,
  );

  if (duplicates.length > 0) {
    throw new ConflictException(
      `Duplicate subParameter name: ${duplicates[0]}`,
    );
  }

  // ---- create parameter ----

  const parameter = this.parameterRepo.create({
    brandId,
    infrastructureCategoryId: categoryId,
    infrastructureParameterName: parameterName,
  });

  const savedParameter = await this.parameterRepo.save(parameter);

  const subs = subParameters.map((sub) =>
    this.subParameterRepo.create({
      infrastructureParameterId: savedParameter.id,
      subParameterName: sub.name,
      subParameterType: sub.type,
    }),
  );

  await this.subParameterRepo.save(subs);

  return {
    message: 'Infrastructure parameter created successfully',
    data: savedParameter,
  };
}

  async findAll(subparameter?: string) {

    const rows = await this.parameterRepo.find({
      relations: ['brand', 'subParameters', 'category'],
    });

    if (subparameter === 'true') {

      return rows.map((p) => ({
        brand: p.brand || {},
        parameterName: p.infrastructureParameterName,
        category: p.category || { id: p.infrastructureCategoryId },
        subParameters: p.subParameters.map((s) => ({
          name: s.subParameterName,
          type: s.subParameterType,
        })),
      }));
    }

    return rows.map((p) => ({
      brand: p.brand || {},
      parameterName: p.infrastructureParameterName,
      category: p.category || { id: p.infrastructureCategoryId },
    }));
  }

  async findByBrand(brandId: number, subparameter?: string) {

    const rows = await this.parameterRepo.find({
      where: { brandId },
      relations: ['brand', 'subParameters', 'category'],
    });

    if (subparameter === 'true') {

      return rows.map((p) => ({
        brand: p.brand || {},
        parameterName: p.infrastructureParameterName,
        category: p.category || { id: p.infrastructureCategoryId },
        subParameters: p.subParameters.map((s) => ({
          name: s.subParameterName,
          type: s.subParameterType,
        })),
      }));
    }

    return rows.map((p) => ({
      brand: p.brand || {},
      parameterName: p.infrastructureParameterName,
      category: p.category || { id: p.infrastructureCategoryId },
    }));
  }

  async findOne(id: number) {

    const parameter = await this.parameterRepo.findOne({
      where: { id },
      relations: ['brand', 'subParameters', 'category'],
    });

    if (!parameter) {
      throw new NotFoundException(`Parameter with id ${id} not found`);
    }

    return parameter;
  }
}