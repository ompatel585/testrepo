import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Files, FileType } from 'src/common/entities/files.entity';
import { User } from 'src/common/entities/user.entity';
import { WorkHistory } from 'src/common/entities/work-history.entity';
import { Work } from 'src/common/entities/work.entity';
import { EntityManager, Repository } from 'typeorm';
import { AddFileDto, workFileUploadFileType } from './dto/add-file.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(Files)
    private fileRepository: Repository<Files>,
    private fileUploadService: FileUploadService,
  ) {}

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop();
  }

  private getFileType(fileName: string): FileType {
    const extension = this.getFileExtension(fileName).toLowerCase();
    const extensionToFileTypeMap = workFileUploadFileType.fileTypeMap;

    return extensionToFileTypeMap[extension] || 'unknown';
  }

  async getFilesByWork(workId: number, version: number): Promise<Files[]> {
    const files = await this.fileRepository.find({
      where: { workId: workId, version: version },
    });
    const presignedUrlPromises = [];

    for (const file of files) {
      const filePath = file.compressedFilePath ? file.compressedFilePath : file.filePath;

      if (filePath) {
        const filePathUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(filePath)
          .then((url) => {
            file.filePath = url;
          });
        presignedUrlPromises.push(filePathUrlPromise);
      }
    }
    await Promise.all(presignedUrlPromises);
    return files;
  }

  async find(fileId: number): Promise<Files> | null {
    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) {
      throw new NotFoundException('file not found!');
    }
    if (file.filePath) {
      file.filePath = await this.fileUploadService.generateGetObjectPresignedUrl(
        file.filePath,
      );
    }

    return file;
  }

  async addFile(
    work: Work,
    userId,
    workHistory: WorkHistory,
    filePath: string,
    addFileDto: AddFileDto,
    manager?: EntityManager,
  ) {
    let file = this.fileRepository.create({
      work,
      userId,
      workHistory,
      version: work.version,
      filePath,
      fileType: this.getFileType(addFileDto.fileName),
      ...addFileDto,
    });

    if (manager) {
      await manager.save(file);
    } else {
      await this.fileRepository.save(file);
    }
    return 'file added';
    // add the file in table
    // generate and return presigned url
  }

  async deleteFile(fileId: number) {
    return await this.fileRepository.delete(fileId);
    return 'file deleted ' + fileId;
    // delete the file from s3
    // delete the file from table
  }
}
