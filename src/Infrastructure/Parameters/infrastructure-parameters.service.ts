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
import { InfrastructureCategory } from 'src/common/entities/infrastructure-category.entity';
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

    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }

    if (brandId) {
      const brand = await this.brandRepo.findOne({
        where: { id: brandId },
      });

      if (!brand) {
        throw new NotFoundException(`Brand ${brandId} not found`);
      }
    }

    const existing = await this.parameterRepo.findOne({
      where: {
        brandId,
        infrastructureCategoryId: categoryId,
        infrastructureParameterName: parameterName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Parameter "${parameterName}" already exists`,
      );
    }

    if (!subParameters || subParameters.length === 0) {
      throw new BadRequestException('At least one subParameter is required');
    }

    const names = subParameters.map((s) => s.name.trim().toLowerCase());

    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index,
    );

    if (duplicates.length > 0) {
      throw new ConflictException(
        `Duplicate subParameter name: ${duplicates[0]}`,
      );
    }

    const parameter = this.parameterRepo.create({
      brandId,
      infrastructureCategoryId: categoryId,
      infrastructureParameterName: parameterName,
    });

    const savedParameter = await this.parameterRepo.save(parameter);

    const subEntities = subParameters.map((sub) =>
      this.subParameterRepo.create({
        infrastructureParameterId: savedParameter.id,
        subParameterName: sub.name,
        subParameterType: sub.type,
      }),
    );

    await this.subParameterRepo.save(subEntities);

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