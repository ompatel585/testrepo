import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SubmissionService } from './eventSubmission.service';
import { CreateSubmissionDto } from '../dto/create-event-submission.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { CreateProfessionalSubmissionDto } from '../dto/create-event-submission-professional.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { FilterSubmissionDto } from '../dto/filter-submission.dto';
import { CreateEventRatingDto } from '../dto/create-event-rating.dto';
import { UpdateSubmissionStatusDto } from '../dto/update-submission-status.dto';
import { AssignSubmissionDto } from '../dto/assign-submission.dto';
import { UserFirewall } from 'src/common/decorator/user-firewall.decorator';
import { UserExistsGuard } from 'src/common/guard/user-firewall.guard';
import { FilterEventRatingDto } from '../dto/filter-event-rating.dto';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { JuryRole } from 'src/common/entities/eventRating.entity';
import { UpdateEventRatingDto } from '../dto/update-event-rating.dto';

@Controller('event-submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  // role guard & eventSubmissionGuard only valid student should submit
  @Post()
  async createSubmission(@Body() dto: CreateSubmissionDto) {
    try {
      const result = await this.submissionService.create(dto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('SubmissionController:', error);
      throw error;
    }
  }

  @Public()
  @Post('professional')
  async createProfessionalSubmission(@Body() dto: CreateProfessionalSubmissionDto) {
    try {
      const result = await this.submissionService.createProfessional(dto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('SubmissionController:', error);
      throw error;
    }
  }

  @Patch('status')
  async updateSubmissionStatus(@Body() dto: UpdateSubmissionStatusDto) {
    try {
      const result = await this.submissionService.updateSubmissionStatus(dto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('SubmissionController:updateSubmissionStatus:', error);
      throw error;
    }
  }

  @Get('category-wise-submissions/:eventId')
  async getCategoryWiseSubmissions(@Param('eventId') eventId: number, @Req() req: any) {
    const juryId = req.user?.userId;
    if (!juryId) throw new UnauthorizedException('Jury ID not found in request');
    const data = await this.submissionService.getCategoryWiseSubmissions(eventId, juryId);
    if (!data) throw new NotFoundException('No submissions found');
    return {
      success: true,
      message: 'Category-wise submissions fetched successfully',
      data,
    };
  }

  @Get('submissions')
  async getFilteredSubmissions(@Req() req: any, @Query() query: FilterSubmissionDto) {
    try {
      const page = query.page ?? 1;
      const count = query.count ?? 20;

      const parsedRatings = query.rating ? JSON.parse(query.rating) : [];
      const parsedBuckets = query.bucket ? JSON.parse(query.bucket) : [];
      const parsedStatus = query.status ? JSON.parse(query.status) : [];

      const result = await this.submissionService.getFilteredSubmissions({
        page,
        count,
        rating: parsedRatings,
        buckets: parsedBuckets,
        categoryId: query.categoryId,
        user: req.user,
        status: parsedStatus,
        eventId: query.eventId,
      });

      return new ResponseHelper(result);
    } catch (error) {
      console.error('SubmissionController:', error);
      throw error;
    }
  }

  @Post('rating')
  async postRating(@Body() dto: CreateEventRatingDto) {
    try {
      const result = await this.submissionService.createRating(dto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('SubmissionController - postRating:', error);
      throw error;
    }
  }

  @UseGuards(UserExistsGuard)
  @UserFirewall()
  @Post('assign')
  async assignSubmission(@Body() body: AssignSubmissionDto) {
    try {
      console.log(body);
      const result = await this.submissionService.assignSubmission(body);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('Submission assignment to jury failed', error);
      throw error;
    }
  }

  @Get('list-published')
  async getPublishedRatings(
    @Query() queryParams: QueryParamsDto,
    @Query() filter: FilterEventRatingDto,
    @Query('eventId') eventId: number,
    @Query('categoryId') categoryId: number,
    @Query('juryType') juryType: string,
    @Query('winner') winner: number,
    @Query('runnerUp') runnerUp: number,
    @Query('wildcard') wildcard: number,
    @Query('module') module: string,
  ) {
    const result = await this.submissionService.getPublishedList(
      Number(categoryId),
      Number(eventId),
      juryType as JuryRole,
      Number(winner),
      Number(runnerUp),
      Number(wildcard),
      module,
      { ...queryParams, filter },
    );
    return new ResponseHelper(result);
  }

  @Put('update/rating')
  async updateEventRating(@Body() updateDto: UpdateEventRatingDto) {
    try {
      const result = await this.submissionService.updateRating(updateDto);
      return new ResponseHelper(result);
    } catch (error) {
      console.error('SubmissionController:updateEventRating:', error);
      throw error;
    }
  }
}
