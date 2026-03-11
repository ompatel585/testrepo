import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { AddThumbnailDto } from './dto/add-thumbnail.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ProconnectCenterEmployeeTypeRolesArray, Role } from 'src/common/enum/role.enum';
import { BookAccessGuard } from 'src/common/guard/book-access.guard';
import { FetchEmployeeBookDto } from './dto/fetch-employee-book';
import { GenerateDrmLinkDto } from 'src/admin/drm/dto/generate-drm-link.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Roles(Role.Student)
  @Get('my-courses')
  async getMyCourses(@DefaultUser() user: DefaultUserResponse) {
    try {
      const courses = await this.courseService.getMapCourses(user);
      return new ResponseHelper(courses, courses.length);
    } catch (error) {
      console.log('getMyCourses', error);
      throw error;
    }
  }

  @Roles(Role.Student)
  @Get('student-books')
  async getStudentBooks(@DefaultUser() user: DefaultUserResponse) {
    try {
      const courseWiseBooks = await this.courseService.getStudentMappedBooks(user);

      return new ResponseHelper(courseWiseBooks, courseWiseBooks.length);
    } catch (error) {
      console.log('getStudentBooks', error);
      throw error;
    }
  }

  @Roles(...ProconnectCenterEmployeeTypeRolesArray)
  @Get('employee-books')
  async getEmployeeBooks(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: FetchEmployeeBookDto,
  ) {
    try {
      const { books, count } = await this.courseService.getEmployeeMappedBooks(
        user,
        queryDto,
      );

      return new ResponseHelper(books, count);
    } catch (error) {
      console.log('getEmployeeBooks', error);
      throw error;
    }
  }

  @UseGuards(BookAccessGuard)
  @Get('module/:moduleId')
  async getModuleDetails(
    @DefaultUser() user: DefaultUserResponse,
    @Param(
      'moduleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    moduleId: number,
  ) {
    try {
      return new ResponseHelper(
        await this.courseService.getModuleDetails(user, moduleId),
      );
    } catch (error) {
      console.log('getModuleDetails', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Patch(':id/thumbnail')
  async addThumbnail(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    id: number,
    @Body() addThumbnailDto: AddThumbnailDto,
  ) {
    try {
      return this.courseService.addModuleThumbnail(id, addThumbnailDto);
    } catch (error) {
      console.log('CourseModuleController->addModuleThumbnail', error);
      throw error;
    }
  }

  @UseGuards(BookAccessGuard)
  @Post('module/:moduleId/generate-link')
  async generateLink(
    @DefaultUser() user: DefaultUserResponse,
    @Param(
      'moduleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    moduleId: number,
    @Body() generateDrmLinkDto: GenerateDrmLinkDto,
  ) {
    try {
      return new ResponseHelper(
        await this.courseService.generateLink(user, moduleId, generateDrmLinkDto),
      );
    } catch (error) {
      console.log('generateLink =>', error);
      throw error;
    }
  }

  @UseGuards(BookAccessGuard)
  @Post('module/:moduleId/generate-file')
  async generateFile(
    @DefaultUser() user: DefaultUserResponse,
    @Param(
      'moduleId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    moduleId: number,
    @Body() generateDrmLinkDto: GenerateDrmLinkDto,
    @Res() res: Response,
  ) {
    try {
      const file = await this.courseService.generateFile(
        user,
        moduleId,
        generateDrmLinkDto,
      );

      res.setHeader('Content-Type', file.contentType || 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="URLLink.acm"');

      res.send(file.data);
    } catch (error) {
      console.log('generateLink =>', error);
      throw error;
    }
  }
}
