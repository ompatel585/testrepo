import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfrastructureCategory } from 'src/common/entities/infrastructure-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class InfrastructureCategoryService {
  constructor(
    @InjectRepository(InfrastructureCategory)
    private categoryRepo: Repository<InfrastructureCategory>,
  ) { }

  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: {
        name: dto.name,
        brandId: dto.brandId,
        status: 1,
      },
    });

    if (exists) {
      throw new ConflictException(
        'Category with same name already exists in this brand',
      );
    }

    const category = this.categoryRepo.create(dto);

    return this.categoryRepo.save(category);
  }

  async findAll() {
    const [items, count] = await this.categoryRepo.findAndCount({
      where: { status: 1 },
      relations: ['brand'],
    });
    return { items, count };
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const name = dto.name ?? category.name;
    const brandId = dto.brandId ?? category.brandId;

    const exists = await this.categoryRepo.findOne({
      where: {
        name,
        brandId,
        status: 1,
      },
    });

    if (exists && exists.id !== id) {
      throw new ConflictException(
        'Category with same name already exists in this brand',
      );
    }

    await this.categoryRepo.update(id, dto);

    return await this.findOne(id);
  }

  async delete(id: number) {
    const category = await this.findOne(id);

    await this.categoryRepo.remove(category);

    return {
      message: 'successfully deleted category',
    };
  }
}