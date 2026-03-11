import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookQueryDto } from './dto/book-query.dto';
import { TransformQuery } from 'src/common/transform/transform-query.decorator';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { EditBookDto } from './dto/edit-book.dto';
import { UploadDto } from './dto/upload.dto';
import { AddThumbnailDto } from './dto/add-thumbnail.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ProconnectAptrackEmployeeTypeRolesArray, Role } from 'src/common/enum/role.enum';
import { S3MultipartService } from 'src/file-upload/s3-multipart.service';
import { InitiateMultiPartUploadDto } from './dto/initiate-multipart-upload.dto';
import {
  getAptrack2BrandIdList,
  S3_BOOK,
  S3_BOOK_UPLOAD_DIR,
} from 'src/common/constants';
import { generateUniqueFileName } from 'src/common/helper/file.helper';
import { BookAccessGuard } from 'src/common/guard/book-access.guard';
import { MasterService } from 'src/master/master.service';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/entities/userRole.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('admin/book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly s3MultipartService: S3MultipartService,
    private readonly masterService: MasterService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  @Roles(
    Role.Admin,
    Role.Moderator,
    Role.DigitalAuditor,
    ...ProconnectAptrackEmployeeTypeRolesArray,
  )
  @Get()
  @TransformQuery(BookQueryDto)
  async getAllBooks(
    @DefaultUser() user: DefaultUserResponse,
    @Query() queryDto: BookQueryDto,
  ) {
    try {
      let searchKeys = ['aptrack_1_book_id', 'name'];
      if (
        [
          Role.Moderator,
          Role.DigitalAuditor,
          ...ProconnectAptrackEmployeeTypeRolesArray,
        ].includes(user.activeRole.role)
      ) {
        const subBrandIds = user.activeRole.subBrandIds;

        const subBrandKeys = await this.masterService.convertToBrandsKey(subBrandIds);

        const brand = await this.masterService.getBrandById(user.activeRole.brandId);

        if (getAptrack2BrandIdList().includes(brand.key)) {
          queryDto.filter.aptrack2SubBrandKeys = subBrandKeys;
          searchKeys = ['aptrack_2_book_id', 'name'];
        } else {
          queryDto.filter.aptrack1SubBrandKeys = subBrandKeys;
        }
      }
      // figure-out aptrack1 or aptrack2 bookId for admin
      const { newBooks, nextPage } = await this.bookService.findAll(queryDto, searchKeys);

      return new ResponseHelper(newBooks, 0, { nextPage });
    } catch (error) {
      console.log('BookController->getAllBooks', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @UseGuards(BookAccessGuard)
  @Get(':id')
  async showBook(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    bookId: number,
  ) {
    try {
      return new ResponseHelper(await this.bookService.show(bookId));
    } catch (error) {
      console.log('BookController->showBook', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @UseGuards(BookAccessGuard)
  @Patch(':id')
  async editBook(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    bookId: number,
    @Body(new ValidationPipe()) editBookDto: EditBookDto,
  ) {
    try {
      await this.bookService.edit(bookId, editBookDto);
      return new ResponseHelper('update successfully');
    } catch (error) {
      console.log('BookController->showBook', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @UseGuards(BookAccessGuard)
  @Post(':id/upload')
  async upload(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    bookId: number,
    @Body(new ValidationPipe()) uploadDto: UploadDto,
  ) {
    try {
      const data = await this.bookService.upload(bookId, uploadDto);

      return new ResponseHelper(data);
    } catch (error) {
      console.log('BookController->upload', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @UseGuards(BookAccessGuard)
  @Post(':id/initiate-multipart-upload')
  async initiateMultiPartUpload(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    bookId: number,
    @Body(new ValidationPipe()) InitiateMultiPartUploadDto: InitiateMultiPartUploadDto,
  ) {
    try {
      const filePath = `${S3_BOOK}/${bookId}/${S3_BOOK_UPLOAD_DIR}/${generateUniqueFileName(InitiateMultiPartUploadDto.fileName)}`;
      const uploadId = await this.s3MultipartService.initiateMultipartUpload(
        filePath,
        InitiateMultiPartUploadDto.contentType,
      );

      return new ResponseHelper({ uploadId, filePath });
    } catch (error) {
      console.log('BookController->upload', error);
      throw error;
    }
  }

  @Roles(Role.Admin, Role.Moderator)
  @UseGuards(BookAccessGuard)
  @Patch(':id/thumbnail')
  async addThumbnail(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    bookId: number,
    @Body(new ValidationPipe()) addThumbnailDto: AddThumbnailDto,
  ) {
    try {
      const data = await this.bookService.addThumbnail(bookId, addThumbnailDto);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('BookController->addThumbnail', error);
      throw error;
    }
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async deleteBook(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    bookId: number,
  ) {
    try {
      await this.bookService.deleteBook(bookId);
      return new ResponseHelper('Deleted successfully');
    } catch (error) {
      console.log('BookController->deleteBook', error);
      throw error;
    }
  }
}
