import {
  Controller,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Get,
  ParseIntPipe,
  HttpStatus,
  Req,
  Query,
  Patch,
} from '@nestjs/common';

import { JobService } from './job.service';
import { Request } from 'express';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { JobFilterDto, JobQueryDto } from './dto/job-filter.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { CompanyService } from 'src/company/company.service';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';

@Controller('job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly companyService: CompanyService,
  ) {}

  @Post()
  async createJob(
    @Req() req: Request,
    @Body('jobData', new ValidationPipe()) createJobDto: CreateJobDto,
    @Body('companyData', new ValidationPipe()) createCompanyDto: CreateCompanyDto,
  ) {
    try {
      let companyId = createJobDto?.companyId;
      let job;

      // If companyId is provided, no need to add a new company
      if (!companyId) {
        // Create a new company if companyId is not present
        const result = await this.companyService.createCompany(createCompanyDto);
        createJobDto.companyId = result?.companyId;
      }

      // Pass the existing companyId or the newly created company to the job creation method
      job = await this.jobService.createJob(req.user, createJobDto);

      return new ResponseHelper('success');
    } catch (error) {
      console.log('JobController->createJob', error);
      throw error;
    }
  }

  @Patch(':id')
  async updateJob(
    @Req() req: Request,
    @Body(new ValidationPipe()) updateJobDto: UpdateJobDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    jobId: number,
  ) {
    try {
      return await this.jobService.update(req.user, updateJobDto, jobId);
    } catch (error) {
      console.log('JobController->updateJob', error);
      throw error;
    }
  }

  @Patch(':id/status')
  async updateJobStatus(
    @Req() req: Request,
    @Body(new ValidationPipe()) updateJobDto: UpdateJobStatusDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    jobId: number,
  ) {
    try {
      return await this.jobService.updateJobStatus(req.user, updateJobDto, jobId);
    } catch (error) {
      console.log('JobController->updateJobStatus', error);
      throw error;
    }
  }

  @Get(':id')
  async job(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const result = await this.jobService.show({ jobId: id });
      return new ResponseHelper(result);
    } catch (error) {
      console.log('jobController->job', error);
      throw error;
    }
  }

  @Get()
  @TransformQuery(JobQueryDto)
  async getJobList(@Req() req: any, @Query() queryDto: JobQueryDto) {
    try {
      let searchKeys = [{ key: 'name', alias: 'jobTitle' }];
      const result = await this.jobService.findAll(queryDto, searchKeys);
      return new ResponseHelper(result);
    } catch (error) {
      console.log('JobController->getJobList', error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteJobById(
    @Req() req: Request,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    jobId: number,
  ) {
    return this.jobService.delete({ jobId: jobId });
  }
}
