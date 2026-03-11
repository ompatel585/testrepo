import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkHistory } from 'src/common/entities/work-history.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateWorkDto } from './dto/create-work.dto';
import { Work } from 'src/common/entities/work.entity';
import { UpdateWorkDto } from './dto/update-work.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class WorkHistoryService {
  constructor(
    @InjectRepository(WorkHistory)
    private workHistoryRepository: Repository<WorkHistory>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createWorkDto: CreateWorkDto | UpdateWorkDto,
    work: Work,
    manager: EntityManager,
    version = 1,
  ) {
    const workHistory = this.workHistoryRepository.create({
      ...createWorkDto,
      work,
      version,
    });
    return await manager.save(workHistory);
  }

  async update(
    updateWorkDto: UpdateWorkDto,
    workHistory: WorkHistory,
    manager: EntityManager,
  ) {
    workHistory = this.workHistoryRepository.create({
      ...workHistory,
      ...updateWorkDto,
    });

    return await manager.save(workHistory);
  }

  async getCurrentHistory(workId: number, version: number) {
    return this.workHistoryRepository.findOne({
      where: { work: { id: workId }, version },
    });
  }

  async showHistory(workId: number, version: number) {
    const workHistory = await this.workHistoryRepository.findOne({
      where: { work: { id: workId }, version },
      relations: {
        files: true,
      },
    });

    if (!workHistory) throw new NotFoundException();

    if (workHistory.thumbnail) {
      workHistory.thumbnail = await this.fileUploadService.generateGetObjectPresignedUrl(
        workHistory.thumbnail,
      );
    }
    const presignedUrlPromises = [];

    for (const file of workHistory.files) {
      if (file.filePath) {
        const filePathUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(file.filePath)
          .then((url) => {
            file.filePath = url;
          });
        presignedUrlPromises.push(filePathUrlPromise);
      }
    }
    await Promise.all(presignedUrlPromises);

    return workHistory;
  }

  async getAllWorkHistory(workId: number) {
    return this.workHistoryRepository.find({
      where: { work: { id: workId } },
    });
  }
}
