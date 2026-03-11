import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorator/roles.decorator';
import { certificateByNameDto } from './dto/fetch-cert-by-name-dto';
import { CertAccessGuard } from 'src/common/guard/cert-access.guard';
import { BCAccessGuard } from 'src/common/guard/bc-access.guard';
import { bcReceiptDto } from './dto/bcReceipt.dto';
import { getAptrack2BrandIdList } from 'src/common/constants';
import { Response } from 'express';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { MasterService } from 'src/master/master.service';

/**
 * only student should access the academic controller
 */
@Roles(Role.Student)
@Controller('academic')
export class AcademicController {
  constructor(
    private academicService: AcademicService,
    private readonly masterService: MasterService,
  ) {}

  @Get('attendance')
  async getAttendance(@DefaultUser() user: DefaultUserResponse) {
    try {
      const attendance = await this.academicService.getMapAttendance(user);
      return new ResponseHelper(attendance);
    } catch (error) {
      console.log('academic->getAttendance', error);
      throw error;
    }
  }

  // @Get('fee')
  // async getMyFees(@Req() req: any) {
  //   try {
  //     const studentDetailId = req.user.aptrackUserId;
  //     // const studentDetailId = '621145';
  //     const feesData = await this.academicService.getStudentFeeByUserId(studentDetailId);
  //     return new ResponseHelper(feesData, feesData.length);
  //   } catch (error) {
  //     console.log('academic->getMyFees', error);
  //     throw error;
  //   }
  // }

  @Get('certificate')
  async getMyCertificates(@DefaultUser() user: DefaultUserResponse) {
    try {
      const certificates = await this.academicService.getMapCertificate(user);
      return new ResponseHelper(certificates);
    } catch (error) {
      console.log('academic->certificate', error);
      throw error;
    }
  }

  @Get('marks')
  async getCoursePerformance(@DefaultUser() user: DefaultUserResponse) {
    try {
      const marks = await this.academicService.getMapMarks(user);
      return new ResponseHelper(marks);
    } catch (error) {
      console.log('academic->getCoursePerformance', error);
      throw error;
    }
  }

  @Get('my-exam')
  async getUpcomingSevenDaysDoSelectExam(
    @Query(
      'page',
      new DefaultValuePipe(0),
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    page: number,
    @DefaultUser() user: DefaultUserResponse,
  ) {
    try {
      const tests = await this.academicService.getUpcomingSevenDaysDoSelectExam(
        user.userId.toLowerCase(),
        page,
      );
      return new ResponseHelper(tests);
    } catch (error) {
      console.log('academic->getUpcomingSevenDaysDoSelectExam', error);
      throw error;
    }
  }

  @UseGuards(CertAccessGuard)
  @Post('certificate/name')
  async getCertificateByName(
    @DefaultUser() user: DefaultUserResponse,
    @Body() certificateByNameDto: certificateByNameDto,
  ) {
    try {
      const certUrl = await this.academicService.getCertificateByName(
        user,
        certificateByNameDto,
      );
      return new ResponseHelper(certUrl);
    } catch (error) {
      console.log('academic->certificate', error);
      throw error;
    }
  }

  @UseGuards(BCAccessGuard)
  @Post('bc-receipt-url')
  async getBcReceipt(
    @DefaultUser() user: DefaultUserResponse,
    @Body() bcReceiptDto: bcReceiptDto,
  ) {
    try {
      let BCReceiptData = { action: null, receiptToken: null, preSignedURL: null };
      const brand = await this.masterService.getBrandById(user.activeRole.brandId);

      if (getAptrack2BrandIdList().includes(brand.key)) {
        const preSignedURL = await this.academicService.generateBCReceiptSignedUrl(
          user,
          bcReceiptDto,
        );
        BCReceiptData.preSignedURL = preSignedURL;
      } else {
        const { action, receiptToken } =
          await this.academicService.getBCReceiptEncryptedURL(user, bcReceiptDto);
        BCReceiptData.action = action;
        BCReceiptData.receiptToken = receiptToken;
      }
      return new ResponseHelper(BCReceiptData);
    } catch (error) {
      console.log('academic->getBcReceipt-url', error);
      throw error;
    }
  }
}
