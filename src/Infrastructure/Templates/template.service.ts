import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { InfrastructureReviewTemplate } from 'src/common/entities/infrastructure-review-template.entity';
import { CreateTemplateDto, TemplateStatus } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { InfrastructureParameter } from 'src/common/entities/infrastructure-parameter.entity';
import { InfrastructureCategory } from 'src/common/entities/infrastructure-category.entity';
import { InfrastructureSubParameter } from 'src/common/entities/infrastructure-sub-parameter.entity';
import { Brand } from 'src/common/entities/brand.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(InfrastructureReviewTemplate)
    private templateRepo: Repository<InfrastructureReviewTemplate>,

    @InjectRepository(InfrastructureParameter)
    private parameterRepo: Repository<InfrastructureParameter>,

    @InjectRepository(InfrastructureCategory)
    private categoryRepo: Repository<InfrastructureCategory>,

    @InjectRepository(InfrastructureSubParameter)
    private subParameterRepo: Repository<InfrastructureSubParameter>,
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
  ) {}

  async create(dto: CreateTemplateDto) {
    const template = this.templateRepo.create(dto as any);
    const brandExists = await this.brandRepo.findOne({ where: { id: dto.brandId } });
    if (!brandExists) {
      throw new Error(`Brand with ID ${dto.brandId} does not exist`);
    }

    return await this.templateRepo.save(template);
  }

  async findAll() {
    const templates = await this.templateRepo.find({
      where: { status: In([TemplateStatus.PUBLISH, TemplateStatus.DRAFT]) },
      relations: ['brand'],
    });

    const result = [];

    for (const template of templates) {
      const parameters = [];

      for (const param of template.parameters || []) {
        const parameter = await this.parameterRepo.findOne({
          where: { id: param.id },
        });

        if (!parameter) continue;

        const category = await this.categoryRepo.findOne({
          where: { id: parameter.infrastructureCategoryId },
        });

        const subParameters = await this.subParameterRepo.find({
          where: { id: In(param.subParameters || []) },
        });

        parameters.push({
          category,
          parameter: {
            id: parameter.id,
            name: parameter.infrastructureParameterName,
          },
          subParameter: subParameters.map((sp) => ({
            name: sp.subParameterName,
            type: sp.subParameterType,
          })),
        });
      }

      result.push({
        name: template.name,
        brand: template.brand,
        parameters,
      });
    }

    return result;
  }

  async findOne(id: number) {
    const template = await this.templateRepo.findOne({
      where: { id, status: In([TemplateStatus.PUBLISH, TemplateStatus.DRAFT]) },
      relations: ['brand'],
    });

    if (!template) return null;

    const parameters = [];

    for (const param of template.parameters || []) {
      const parameter = await this.parameterRepo.findOne({ where: { id: param.id } });
      if (!parameter) continue;

      const category = await this.categoryRepo.findOne({
        where: { id: parameter.infrastructureCategoryId },
      });
      const subParameters = await this.subParameterRepo.find({
        where: { id: In(param.subParameters || []) },
      });

      parameters.push({
        category,
        parameter: {
          id: parameter.id,
          name: parameter.infrastructureParameterName,
        },
        subParameter: subParameters.map((sp) => ({
          name: sp.subParameterName,
          type: sp.subParameterType,
        })),
      });
    }

    return {
      name: template.name,
      brand: template.brand,
      parameters,
    };
  }

  async update(id: number, dto: UpdateTemplateDto) {
    const template = await this.templateRepo.findOne({
      where: { id },
    });

    if (!template || template.status === TemplateStatus.DELETE) {
      return null;
    }

    const brandExists = await this.brandRepo.findOne({ where: { id: dto.brandId } });
    if (!brandExists) {
      throw new Error(`Brand with ID ${dto.brandId} does not exist`);
    }

    await this.templateRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.templateRepo.update(id, { status: TemplateStatus.DELETE });
    return {
      message: 'successfully deleted template',
    };
  }
}
