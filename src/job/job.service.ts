import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Job } from 'src/common/entities/job.entity';
import { User } from 'src/common/entities/user.entity';
import { JobAttachmentService } from './jobAttachment.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { S3_JOB } from 'src/common/constants';
import { AddJobAttachmentsDto } from './dto/add-job-attachment.dto';
import { generateUniqueFileName } from 'src/common/helper/file.helper';
import { JobQueryDto } from './dto/job-filter.dto';
import { filterQueryBuilder, SearchItem } from 'src/common/helper/query.helper';
import { Company } from 'src/common/entities/company.entity';
import { Centre } from 'src/common/entities/centre.entity';
import { JobCentreMapping } from 'src/common/entities/jobCentreMapping.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { MasterService } from 'src/master/master.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Centre)
    private centreRepository: Repository<Centre>,
    @InjectRepository(JobCentreMapping)
    private jobCentreMappingRepository: Repository<JobCentreMapping>,
    private jobAttachmentService: JobAttachmentService,
    private fileUploadService: FileUploadService,
    private masterService: MasterService,
  ) {}

  async createJob(user: any, createJobDto: CreateJobDto) {
    let centres = [];
    if (createJobDto.centreId == 0) {
      let centerFilter = { brandId: createJobDto.brandId };
      if (createJobDto.area && createJobDto.area !== '') {
        centerFilter['area'] = createJobDto.area;
      }

      if (createJobDto.region && createJobDto.region !== '') {
        centerFilter['region'] = createJobDto.region;
      }

      if (createJobDto.zone && createJobDto.zone !== '') {
        centerFilter['zone'] = createJobDto.zone;
      }

      centres = await this.centreRepository.find({
        where: centerFilter,
      });

      if (centres.length == 0) {
        throw new BusinessException(`Centres not found`);
      }
    } else {
      const centre = await this.masterService.findCentre(createJobDto.centreId);
      centres.push(centre);
    }

    user = new User({ id: user.id });
    let job = this.jobRepository.create({
      ...createJobDto,
      user,
    });

    job = await this.jobRepository.save(job);

    if (centres.length > 0) {
      const jobCentreMappings = centres.map((centre) => {
        return this.jobCentreMappingRepository.create({ job: job, centre });
      });
      await this.jobCentreMappingRepository.save(jobCentreMappings);
    }

    let attachmentPresignedUrls = [];
    if (createJobDto.addJobAttachments.length > 0) {
      for (const attachment of createJobDto.addJobAttachments) {
        const s3Key = `${S3_JOB}/${job.id}/${generateUniqueFileName(attachment.fileName)}`;
        const presignedUrl =
          await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);
        attachmentPresignedUrls.push({ ...attachment, presignedUrl: presignedUrl.url });
        await this.jobAttachmentService.addJobAttachment(job, user.id, s3Key, attachment);
      }
    }

    return { attachmentPresignedUrls };
  }

  async update(user: any, updateJobDto: UpdateJobDto, jobId: number) {
    let job = await this.find({ jobId });
    if (!job) {
      throw new NotFoundException();
    }

    const updatedJob = await this.jobRepository.save({
      ...job,
      ...updateJobDto,
    });

    return updatedJob;
  }

  async updateJobStatus(user: any, updateJobStatus: UpdateJobStatusDto, jobId: number) {
    let job = await this.find({ jobId });

    if (!job) {
      throw new NotFoundException();
    }

    return await this.jobRepository.save({
      ...job,
      status: updateJobStatus.jobStatus,
    });
  }

  async addAttachment(
    jobId: number,
    user: any,
    addJobAttachmentsDto: AddJobAttachmentsDto,
  ) {
    let job = await this.find({ jobId });
    if (!job) {
      throw new NotFoundException();
    }

    if (job.userId != user.id) {
      throw new UnauthorizedException();
    }

    let attachmentPresignedUrls = [];
    for (const attachment of addJobAttachmentsDto.addJobAttachments) {
      const s3Key = `${S3_JOB}/${jobId}/${generateUniqueFileName(attachment.fileName)}`;
      const presignedUrl =
        await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);
      attachmentPresignedUrls.push({ ...attachment, presignedUrl: presignedUrl.url });

      await this.jobAttachmentService.addJobAttachment(job, user.id, s3Key, attachment);
    }

    return attachmentPresignedUrls;
  }

  async show({ jobId }: { jobId: number }) {
    let job = await this.find({ jobId });

    if (!job) throw new NotFoundException();

    const files = await this.jobAttachmentService.getAttachmentsByJob(jobId);
    job.jobAttachments = files;

    return job;
  }

  async find({ jobId }: { jobId: number }) {
    const whereCondition: { id: number } = { id: jobId };

    return await this.jobRepository.findOne({
      where: whereCondition,
    });
  }

  async getAllJobs() {
    const count = 10;
    let jobs = await this.jobRepository.find({});

    return { jobs, count };
  }

  async findAll(queryParams: JobQueryDto, searchKeys?: SearchItem[]) {
    const queryBuilderInstance = this.jobRepository.createQueryBuilder('job');

    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      searchKeys: searchKeys,
    });

    queryBuilder.leftJoinAndSelect('job.user', 'user');
    queryBuilder.leftJoinAndSelect('job.skillCategory', 'skillCategory');
    queryBuilder.leftJoinAndSelect('job.jobType', 'jobType');
    queryBuilder.leftJoinAndSelect('job.company', 'company');
    queryBuilder.leftJoinAndSelect('job.city', 'city');
    queryBuilder.leftJoinAndSelect('job.jobTitle', 'jobTitle');
    queryBuilder.select([
      'job',
      'skillCategory.name',
      'jobTitle.name',
      'jobType.name',
      'company.companyName',
      'company.website',
      'company.logoImage',
      'city.name',
    ]);

    const [items, count] = await queryBuilder.getManyAndCount();

    const presignedUrlPromises = [];

    for (const job of items) {
      // Adding presigned URL for thumbnail
      if (job.company.logoImage) {
        const logoUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(job.company.logoImage)
          .then((url) => {
            job.company.logoImage = url;
          });
        presignedUrlPromises.push(logoUrlPromise);
      }
    }

    await Promise.all(presignedUrlPromises);

    return { items, count };
  }

  async delete({ jobId }: { jobId: number }) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) throw new NotFoundException();

    await this.jobRepository.delete(jobId);

    return job;
  }
}
