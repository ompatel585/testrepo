import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfrastructureCategory } from './entities/infrastructure-category.entity';
import { InfrastructureParameter } from './entities/infrastructure-parameter.entity';
import {
  CreateInfrastructureParameterDto,
  SubParameterDto,
} from './dto/create-infrastructure-parameter.dto';

@Injectable()
export class InfrastructureParametersService {
  constructor(
    @InjectRepository(InfrastructureCategory)
    private readonly categoryRepository: Repository<InfrastructureCategory>,
    @InjectRepository(InfrastructureParameter)
    private readonly parameterRepository: Repository<InfrastructureParameter>,
  ) {}

  async create(
    createDto: CreateInfrastructureParameterDto,
  ): Promise<{ message: string; data: any }> {
    const { brandId, categoryId, parameterName, subParameters } = createDto;

    // If categoryId is provided, use existing category or create new
    let category: InfrastructureCategory;

    if (categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
    }

    // Create new category if parameterName is provided
    if (parameterName) {
      category = this.categoryRepository.create({
        name: parameterName,
        brandId: brandId,
      });
      category = await this.categoryRepository.save(category);
    }

    // If no category exists at this point, throw error
    if (!category) {
      throw new NotFoundException('Category is required');
    }

    // Process subParameters
    const createdParameters = [];

    for (const subParam of subParameters) {
      const paramData: Partial<InfrastructureParameter> = {
        brandId: subParam.brandId ?? brandId,
        infrastructureCategoryId: category.id,
        infrastructureParameterName: subParam.infrastructureParameterName,
        name: subParam.name,
        type: subParam.type,
      };

      const param = this.parameterRepository.create(paramData);
      const savedParam = await this.parameterRepository.save(param);
      createdParameters.push(savedParam);
    }

    return {
      message: 'Infrastructure parameters created successfully',
      data: {
        category,
        parameters: createdParameters,
      },
    };
  }

  async findAll(): Promise<InfrastructureCategory[]> {
    return await this.categoryRepository.find({
      relations: ['parameters'],
    });
  }

  async findOne(id: number): Promise<InfrastructureCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parameters'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }
}

