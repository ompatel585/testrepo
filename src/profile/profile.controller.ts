import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Req,
  Query,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png', 'image/Jpg'];
const VALID_UPLOADS_EXTENSIONS = ['png', 'jpg', 'jpeg'];
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { EditProfileDto } from './dto/edit-profile.dto';
import { EditContactDto } from './dto/edit-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ProconnectCenterEmployeeTypeRolesArray, Role } from 'src/common/enum/role.enum';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { CustomUploadFileTypeValidator } from 'src/common/validation/CustomUploadFileTypeValidator';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PresignedURLKeyDto } from './dto/presigned-url-key.dto';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { S3_COVER, S3_PROFILE } from 'src/common/constants';
import { User } from 'src/common/entities/user.entity';
import { createApiResponseDTO, ResponseHelper } from 'src/common/helper/response.helper';
import { Profile } from 'src/common/entities/profile.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDTO } from './api-response/get-profile.api.response';
import { UsersService } from 'src/users/users.service';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { Brand } from 'src/common/decorator/brands.decorator';
import { RoleBrand } from 'src/common/decorator/role-brand.decorator';

@ApiTags('profile')
@Controller('user')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'profile data' })
  @ApiResponse({
    status: 200,
    type: createApiResponseDTO(Profile),
  })
  @Get('profile')
  async getProfile(@Request() req, @DefaultUser() user: DefaultUserResponse) {
    try {
      const userProfile = await this.profileService.getStudentOrFacultyProfile(user);
      return new ResponseHelper(userProfile);
    } catch (error) {
      console.log('getProfile', error);
      throw error;
    }
  }

  @Get(':id/profile')
  async getProfileByUserId(
    @DefaultUser() user: DefaultUserResponse,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    userId: number,
  ) {
    try {
      const student = await this.usersService.findUserById(userId);
      // throw error if viewers brand doesn't matches with student's
      if (
        !student.userRole.some((userRole) => userRole.brandId === user.activeRole.brandId)
      ) {
        throw new BusinessException();
      }

      const userProfile =
        await this.profileService.getStudentOrFacultyBaseProfile(userId);
      return new ResponseHelper(userProfile);
    } catch (error) {
      console.log('getProfile by userId', error);
      throw error;
    }
  }

  @Patch('profile')
  async editProfile(
    @DefaultUser() user: DefaultUserResponse,
    @Body() updateProfile: EditProfileDto,
  ) {
    try {
      return await this.profileService.editProfile(user, updateProfile);
    } catch (error) {
      console.log('in error of edit-profile: ' + error);
      throw error;
    }
  }

  @Post('profile/edit-contact')
  async editContact(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) editContact: EditContactDto,
  ) {
    try {
      const data = await this.profileService.editContact(user, editContact);
      return new ResponseHelper(data);
    } catch (error) {
      console.log('in error of edit-contact: ' + error);
      throw error;
    }
  }

  @Post('profile/update-contact')
  async updateContact(
    @DefaultUser() user: DefaultUserResponse,
    @Body(new ValidationPipe()) updateContact: UpdateContactDto,
  ) {
    try {
      await this.profileService.updateContact(user, updateContact);
      return 'Updated successfully';
    } catch (error) {
      console.log('in error of update-contact: ' + error);
      throw error;
    }
  }

  @Post('profile/upload-profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImg(
    @DefaultUser() user: DefaultUserResponse,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: VALID_UPLOADS_MIME_TYPES,
            fileExtensions: VALID_UPLOADS_EXTENSIONS,
          }),
        )
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
          message() {
            return `Max File size allowed is 5MB`;
          },
        })
        .build({ errorHttpStatusCode: HttpStatus.FORBIDDEN }),
    )
    file: Express.Multer.File,
  ) {
    try {
      return await this.profileService.uploadProfileImg(user, file);
    } catch (error) {
      console.log('in error of upload-profileimg: ' + error);
      throw error;
    }
  }

  @Post('profile/upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImg(
    @DefaultUser() user: DefaultUserResponse,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: VALID_UPLOADS_MIME_TYPES,
            fileExtensions: VALID_UPLOADS_EXTENSIONS,
          }),
        )
        // .addFileTypeValidator({ fileType: /^image\/(png|jpe?g)$/i })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
          message() {
            return `Max File size allowed is 5MB`;
          },
        })
        .build({ errorHttpStatusCode: HttpStatus.FORBIDDEN }),
    )
    file: Express.Multer.File,
  ) {
    try {
      return await this.profileService.uploadCoverImg(user, file);
    } catch (error) {
      console.log('in error of upload-coverimg: ' + error);
      throw error;
    }
  }

  @Get('profile/put-profile-presignedurl')
  async PutProfilePresignedUrl(
    @DefaultUser() user: DefaultUserResponse,
    @Query(new ValidationPipe()) keydata: PresignedURLKeyDto,
  ) {
    try {
      const userReferenceId = user.id;

      const data = await this.fileUploadService.generatePutObjectPresignedUrl(
        `${S3_PROFILE}/${userReferenceId}/${keydata.presignedURLKey}`,
      );

      return new ResponseHelper(data);
    } catch (error) {
      console.log('error in generatePresignedUrl', error);
      throw error;
    }
  }

  @Get('profile/put-cover-presignedurl')
  async PutCoverPresignedUrl(
    @DefaultUser() user: DefaultUserResponse,
    @Query(new ValidationPipe()) keydata: PresignedURLKeyDto,
  ) {
    try {
      const userReferenceId = user.id;

      const data = await this.fileUploadService.generatePutObjectPresignedUrl(
        `${S3_COVER}/${userReferenceId}/${keydata.presignedURLKey}`,
      );

      return new ResponseHelper(data);
    } catch (error) {
      console.log('error in generatePresignedUrl', error);
      throw error;
    }
  }
}
