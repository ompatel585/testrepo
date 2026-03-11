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
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkHistoryService } from './work-history.service';
import { FileService } from './file.service';
import { AddFilesDto } from './dto/add-file.dto';
import { AddThumbnailDto } from './dto/add-thumbnail.dto';
import { Request } from 'express';
import { UserWorkFilterDto, UserWorkQueryDto } from 'src/work/dto/user-work-filter.dto';
import { UpdateWorkVisibilityDto } from './dto/update-work-visibility.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { CommentFilterDto, CommentQueryDto } from './dto/comment-query.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { runInTransaction } from 'src/common/helper/transaction.helper';
import { DataSource } from 'typeorm';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
// import { CreateWorkDto } from './dto/createWork-work.dto';
// import { UpdateWorkDto } from './dto/update-work.dto';

@Controller('work')
export class WorkController {
  constructor(
    private readonly workService: WorkService,
    private readonly workHistoryService: WorkHistoryService,
    private readonly dataSource: DataSource,
  ) {}

  /* My Work */
  @Get()
  @TransformQuery(UserWorkQueryDto)
  async myWork(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: UserWorkQueryDto,
  ) {
    try {
      if (!queryDto.filter) {
        queryDto.filter = new UserWorkFilterDto();
      }
      queryDto.filter.userId = user.id;
      const searchKeys = [];
      const { works, nextPage } = await this.workService.myWork(
        user,
        queryDto,
        searchKeys,
      );
      return new ResponseHelper(works, 0, { nextPage });
    } catch (error) {
      console.log('WorkController->myWork', error);
      throw error;
    }
  }

  // work by workId
  @Get(':id')
  async work(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const work = await this.workService.show({ workId: id, user });
      return new ResponseHelper(work);
    } catch (error) {
      console.log('WorkController->work', error);
      throw error;
    }
  }

  @Post(':id/view')
  async viewWork(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      await runInTransaction(this.dataSource, async (manager) => {
        await this.workService.addView(user, workId, manager);
      });
      return new ResponseHelper('success');
    } catch (error) {
      console.log('WorkController->viewWork', error);
      throw error;
    }
  }

  @Post(':id/like')
  async addLike(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      await runInTransaction(this.dataSource, async (manager) => {
        await this.workService.addLike(user, workId, manager);
      });
      return new ResponseHelper('success');
    } catch (error) {
      console.log('WorkController->addLike', error);
      throw error;
    }
  }

  @Post(':id/unlike')
  async unLike(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      await runInTransaction(this.dataSource, async (manager) => {
        await this.workService.unLike(user, workId, manager);
      });
      return new ResponseHelper('success');
    } catch (error) {
      console.log('WorkController->unLike', error);
      throw error;
    }
  }

  @Post()
  async createWork(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) createWorkDto: CreateWorkDto,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.workService.create(user, createWorkDto, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->createWork', error);
      throw error;
    }
  }

  @Patch(':id')
  async updateWork(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) updateWorkDto: UpdateWorkDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.workService.update(user, updateWorkDto, workId, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->updateWork', error);
      throw error;
    }
  }

  @Patch(':id/visibility')
  async updateVisibility(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) updateWorkDto: UpdateWorkVisibilityDto,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
  ) {
    try {
      const data = await this.workService.updateVisibility(user, updateWorkDto, workId);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->updateVisibility', error);
      throw error;
    }
  }

  @Put(':id/thumbnail')
  async addThumbnail(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body(new ValidationPipe()) addThumbnailDto: AddThumbnailDto,
  ) {
    try {
      const data = await runInTransaction(this.dataSource, async (manager) => {
        return await this.workService.addThumbnail(id, user, addThumbnailDto, manager);
      });
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->addThumbnail', error);
      throw error;
    }
  }

  /* Work History */

  @Get(':id/work-history')
  async workHistory(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
  ) {
    try {
      const data = await this.workHistoryService.getAllWorkHistory(id);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->workHistory', error);
      throw error;
    }
  }

  @Get(':id/work-history/:version')
  async workHistoryByVersion(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Param(
      'version',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    version: number,
  ) {
    try {
      const data = await this.workHistoryService.showHistory(id, version);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->workHistoryByVersion', error);
      throw error;
    }
  }

  /* File */
  @Post(':id/file')
  async addFile(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) addFilesDto: AddFilesDto,
  ) {
    try {
      const data = await this.workService.addFile(id, user, addFilesDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->addFile', error);
      throw error;
    }
  }

  @Delete(':id/file/:fileId')
  async deleteFile(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @DefaultUser() user: DefaultUserResponse,
    @Param('fileId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    fileId: number,
  ) {
    try {
      const data = await this.workService.deleteFile(id, user, fileId);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('WorkController->deleteFile', error);
      throw error;
    }
  }

  @Post(':id/comment')
  async addComment(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
    @Body(new ValidationPipe()) commentWorkDto: AddCommentDto,
  ) {
    try {
      await runInTransaction(this.dataSource, async (manager) => {
        await this.workService.addComment(user, workId, commentWorkDto, manager);
      });
      return new ResponseHelper('success');
    } catch (error) {
      console.log('WorkController->addComment', error);
      throw error;
    }
  }

  @Delete('/comment/:id')
  async deleteComment(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    commentId: number,
  ) {
    try {
      await runInTransaction(this.dataSource, async (manager) => {
        await this.workService.deleteComment(user, commentId, manager);
      });
      return new ResponseHelper('success');
    } catch (error) {
      console.log('WorkController->deleteComment', error);
      throw error;
    }
  }

  @Get(':id/comment')
  async getComments(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    workId: number,
    @Query() queryDto: CommentQueryDto,
  ) {
    try {
      const { comments, count } = await this.workService.getComments(
        user,
        workId,
        queryDto,
      );
      return new ResponseHelper(comments, count);
    } catch (error) {
      console.log('WorkController->getComments', error);
      throw error;
    }
  }

  // TODO teacher update status with status api patch
  // ':id/status'

  // TODO faculty work list
}
