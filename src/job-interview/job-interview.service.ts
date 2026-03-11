import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobInterviewDto } from './dto/create-job-interview.dto';
import { UpdateJobInterviewDto } from './dto/update-job-interview.dto';
import { JobInterview } from 'src/common/entities/jobInterview.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from 'src/common/entities/user.entity';

@Injectable()
export class JobInterviewService {
  constructor(
    @InjectRepository(JobInterview)
    private jobInterviewRepository: Repository<JobInterview>,
  ) {}

  async create(user: any, createJobInterviewDto: CreateJobInterviewDto) {
    user = new User({ id: user.id });
    let jobInterview = this.jobInterviewRepository.create({
      ...createJobInterviewDto,
      user,
    });

    jobInterview = await this.jobInterviewRepository.save(jobInterview);

    return { jobInterview };
  }

  async update(
    user: any,
    updateJobInterviewDto: UpdateJobInterviewDto,
    jobInterviewId: number,
  ) {
    let jobInterview = await this.find({ jobInterviewId });
    if (!jobInterview) {
      throw new NotFoundException();
    }

    const updatedJobInterview = await this.jobInterviewRepository.save({
      ...jobInterview,
      ...updateJobInterviewDto,
    });

    return updatedJobInterview;
  }

  async show({ jobInterviewId }: { jobInterviewId: number }) {
    let jobInterview = await this.find({ jobInterviewId });

    if (!jobInterview) throw new NotFoundException();

    return jobInterview;
  }

  async find({ jobInterviewId }: { jobInterviewId: number }) {
    const whereCondition: { id: number } = { id: jobInterviewId };

    return await this.jobInterviewRepository.findOne({
      where: whereCondition,
    });
  }

  async getAllJobInterviews() {
    return await this.jobInterviewRepository.find({});
  }

  async delete({ jobInterviewId }: { jobInterviewId: number }) {
    const jobInterview = await this.jobInterviewRepository.findOne({
      where: { id: jobInterviewId },
    });

    if (!jobInterview) throw new NotFoundException();

    await this.jobInterviewRepository.delete(jobInterviewId);

    return jobInterview;
  }

  async findJobwiseInterviews({ jobId }: { jobId: number }) {
    const whereCondition: { jobId: number } = { jobId: jobId };

    return await this.jobInterviewRepository.findAndCount({
      where: whereCondition,
    });
  }
}
