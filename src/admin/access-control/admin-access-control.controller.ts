import { Patch, Body, ValidationPipe, Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { AdminAccessControlService } from './admin-access-control.service';
import { UpdateStudentMetaDataDto } from './dto/update-student-metaData.dto';
import { AdminStudentMetaDataQueryDto } from './dto/admin-student-metadata-query.dto';

@Roles(Role.Admin)
@Controller('admin/access-control')
export class AdminAccessControlController {
  constructor(private readonly adminAccessControlService: AdminAccessControlService) {}
  @Patch('reset-password')
  async changePassword(
    @Body(new ValidationPipe()) resetPasswordDto: AdminResetPasswordDto,
  ) {
    try {
      await this.adminAccessControlService.resetPassword(resetPasswordDto);
      return new ResponseHelper('success');
    } catch (error) {
      console.log('in error of admin reset-password: ' + error);
      throw error;
    }
  }

  @Patch('student-meta-data')
  async updateStudentMetaData(
    @Body()
    updateStudentMetaDataDto: UpdateStudentMetaDataDto,
  ) {
    try {
      await this.adminAccessControlService.updateStudentMetaData(
        updateStudentMetaDataDto,
      );
      return new ResponseHelper('successfully update');
    } catch (error) {
      console.log('in error of admin updateStudentMetaData: ' + error);
      throw error;
    }
  }

  @Get('student-meta-data')
  async getStudentMetaData(@Query() queryDto: AdminStudentMetaDataQueryDto) {
    const studentMetaData = await this.adminAccessControlService.getStudentMetaData(
      queryDto.studentId,
    );
    return new ResponseHelper(studentMetaData);
  }
}
