import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobAttachments } from 'src/common/entities/jobAttachments.entity';
import { User } from 'src/common/entities/user.entity';
import { Job } from 'src/common/entities/job.entity';
import { Repository } from 'typeorm';
import { AddJobAttachmentDto } from './dto/add-job-attachment.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class JobAttachmentService {
  constructor(
    @InjectRepository(JobAttachments)
    private fileRepository: Repository<JobAttachments>,
    private fileUploadService: FileUploadService,
  ) {}

  async getAttachmentsByJob(JobId: number): Promise<JobAttachments[]> {
    const attachments = await this.fileRepository.find({
      where: { jobId: JobId },
    });

    for (const attachment of attachments) {
      if (attachment.filePath) {
        attachment.filePath = await this.fileUploadService.generateGetObjectPresignedUrl(
          attachment.filePath,
        );
      }
    }

    return attachments;
  }

  async find(jobAttachmentId: number): Promise<JobAttachments> | null {
    const attachment = await this.fileRepository.findOneBy({ id: jobAttachmentId });
    if (attachment.filePath) {
      attachment.filePath = await this.fileUploadService.generateGetObjectPresignedUrl(
        attachment.filePath,
      );
    }

    return attachment;
  }

  async addJobAttachment(
    job: Job,
    userId,
    filePath: string,
    addJobAttachmentDto: AddJobAttachmentDto,
  ) {
    let attachment = this.fileRepository.create({
      job,
      filePath,
      ...addJobAttachmentDto,
    });

    await this.fileRepository.save(attachment);
    return 'Attachment added';
  }

  async deleteAttachmnet(attachmentId: number) {
    return await this.fileRepository.delete(attachmentId);
  }
}
