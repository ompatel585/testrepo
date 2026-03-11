import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EProject } from 'src/common/entities/eproject.entity';
import { Repository } from 'typeorm';
import { AddEprojectDto } from './dto/add-eproject.dto';
import { EprojectListQueryDto } from './dto/eproject-list-query.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { UpdateEprojectDto } from './dto/update-eproject.dto';
import { AllocateEprojectDto } from './dto/allocate-eproject.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';

@Injectable()
export class EprojectService {
  constructor(
    @InjectRepository(EProject)
    private eprojectRepository: Repository<EProject>,
  ) {}

  async findAll(
    user: DefaultUserResponse,
    queryParams: EprojectListQueryDto,
    searchKeys?: string[],
  ) {
    const queryBuilderInstance = this.eprojectRepository.createQueryBuilder('eproject');
    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      searchKeys: searchKeys,
      hasMore: true,
    });

    let records = await queryBuilder.getMany();
    const nextPage = queryParams.limit != -1 ? records.length > queryParams.limit : false;
    records = nextPage ? records.slice(0, -1) : records;

    return { records, nextPage };
  }

  async create(addEprojectDto: AddEprojectDto) {
    const eproject = this.eprojectRepository.create(addEprojectDto);

    return await this.eprojectRepository.save(addEprojectDto);
  }

  async update(eprojectExamCode: string, updateEprojectDto: UpdateEprojectDto) {
    return await this.eprojectRepository.update({ eprojectExamCode }, updateEprojectDto);
  }

  async allocate(
    eprojectExamCode: string,
    studentKey: string,
    allocateEprojectDto: AllocateEprojectDto,
  ) {
    const eproject = await this.eprojectRepository.findOne({
      where: { eprojectExamCode, studentKey },
    });

    if (!eproject) {
      throw new NotFoundException('e-project not found');
    }

    return await this.eprojectRepository.save({ ...eproject, ...allocateEprojectDto });
  }
}
