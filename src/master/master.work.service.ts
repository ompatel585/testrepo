import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkCategory } from 'src/common/entities/workCategory.entity';
import { Not, Repository } from 'typeorm';
import { WorkCategoryQueryDto } from './dto/work/work-category-query.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { AddWorkCategoryDto } from './dto/work/add-work-category.dto';
import { EditWorkCategory } from './dto/work/edit-work-category.dto';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { UpdateWorkCategoryStatus } from './dto/work/update-work-category-status.dto';

@Injectable()
export class MasterWorkService {
  constructor(
    @InjectRepository(WorkCategory)
    private workCategoryRepository: Repository<WorkCategory>,
  ) {}

  async create(dto: AddWorkCategoryDto) {
    const workCategory = this.workCategoryRepository.create(dto);

    return await this.workCategoryRepository.save(workCategory);
  }

  async list(queryParams: WorkCategoryQueryDto, searchKeys?: string[]) {
    const query = this.workCategoryRepository.createQueryBuilder('work_category');

    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: query,
      filters: queryParams.filter,
      searchKeys: searchKeys,
    });

    queryBuilder.leftJoinAndSelect('work_category.brand', 'brand');
    queryBuilder.select(['work_category', 'brand.name']);

    const [records, count] = await queryBuilder.getManyAndCount();

    return { records, count };
  }

  async view(id: number) {
    const workCategory = await this.workCategoryRepository.findOne({ where: { id } });

    if (!workCategory) {
      throw new NotFoundException();
    }

    return workCategory;
  }

  async alreadyExistsValidate(brandId: number, name: string, id: number | null = null) {
    const where: any = { brandId, name };

    if (id) {
      where.id = Not(id);
    }

    const workCategory = await this.workCategoryRepository.findOne({ where });

    if (workCategory) {
      throw new BusinessException(`${name} already exits`);
    }
  }

  async edit(id: number, dto: EditWorkCategory) {
    const workCategory = await this.view(id);
    await this.alreadyExistsValidate(dto.brandId, dto.name, id);

    return await this.workCategoryRepository.save({ ...workCategory, ...dto });
  }

  async status(id: number, dto: UpdateWorkCategoryStatus) {
    const workCategory = await this.view(id);

    return await this.workCategoryRepository.save({ ...workCategory, ...dto });
  }

  async delete(id: number) {
    const workCategory = await this.view(id);

    return await this.workCategoryRepository.delete(workCategory);
  }
}
