import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { JobInterviewService } from './job-interview.service';
import { CreateJobInterviewDto } from './dto/create-job-interview.dto';
import { UpdateJobInterviewDto } from './dto/update-job-interview.dto';
import { Request } from 'express';

@Controller('job/interview')
export class JobInterviewController {
  constructor(private readonly jobInterviewService: JobInterviewService) {}

  @Post()
  async createJobInterview(
    @Req() req: Request,
    @Body(new ValidationPipe()) createJobInterviewDto: CreateJobInterviewDto,
  ) {
    try {
      return await this.jobInterviewService.create(req.user, createJobInterviewDto);
    } catch (error) {
      console.log('JobController->createJob', error);
      throw error;
    }
  }

  @Patch(':id')
  async updateJobInterview(
    @Req() req: Request,
    @Body(new ValidationPipe()) updateJobInterviewDto: UpdateJobInterviewDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    jobInterviewId: number,
  ) {
    try {
      return await this.jobInterviewService.update(
        req.user,
        updateJobInterviewDto,
        jobInterviewId,
      );
    } catch (error) {
      console.log('JobInterviewController->updateJobInterview', error);
      throw error;
    }
  }

  @Get()
  getAllJobInterviews() {
    try {
      return this.jobInterviewService.getAllJobInterviews();
    } catch (error) {
      console.log('getAllJobInterviews', error);
      throw error;
    }
  }

  @Get(':id/list')
  async jobInterviewList(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      return await this.jobInterviewService.findJobwiseInterviews({ jobId: id });
    } catch (error) {
      console.log('jobApplicationController->jobApplication', error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteJobInterviewById(
    @Req() req: Request,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    jobInterviewId: number,
  ) {
    return this.jobInterviewService.delete({ jobInterviewId: jobInterviewId });
  }

  @Get(':id')
  async jobInterview(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      return await this.jobInterviewService.show({ jobInterviewId: id });
    } catch (error) {
      console.log('jobIntreviewController->jobInterview', error);
      throw error;
    }
  }
}
