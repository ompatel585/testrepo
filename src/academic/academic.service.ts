import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Fee } from 'src/common/entities/fee.entity';
import { Repository } from 'typeorm';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import axios from 'axios';
import { studentFeesEndpoint } from 'src/common/external-services/aptrack/endpoints';
import { getDoSelectTestsEndpoint } from 'src/common/external-services/do-select/endpoints';
import {
  IAptrackStudentPGMetaData,
  UserMetaData,
} from 'src/common/entities/user-metadata.entity';
import {
  attendanceMetaDataMap,
  certificatesMetaDataMap,
  marksMetaDataMap,
} from 'src/common/helper/userMetaData.helper';
import { isStudentMetaData } from 'src/common/types/guard';
import { ICertificatesMetaDataMap } from 'src/common/interfaces/userMetaData.interface';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from 'src/common/exceptions/permission.exception';
import {
  getAptrack2BrandIdList,
  S3_BC_RECEIPT,
  S3_DIGITAL_LEARNING_CERTIFICATES,
} from 'src/common/constants';
import path from 'path';
import {
  fetchStudentCertificateByFileName,
  generatedBCReceiptPdfFile,
} from 'src/common/external-services/aptrack-one/endpoints';
import { certificateByNameDto } from './dto/fetch-cert-by-name-dto';
import { MasterService } from 'src/master/master.service';
import { bcReceiptDto } from './dto/bcReceipt.dto';
import { encryptBcReceiptPayload } from 'src/common/helper/BCReceiptPayloadEncryption.helper';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { UsersService } from 'src/users/users.service';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';

@Injectable()
export class AcademicService {
  private readonly aptrackApiKey: string;
  private readonly logger = new Logger(AcademicService.name);
  constructor(
    @InjectRepository(Fee)
    private feeRepository: Repository<Fee>,

    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,

    private readonly fileUploadService: FileUploadService,
    private readonly masterService: MasterService,

    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.aptrackApiKey = process.env.APTRACK_API_KEY;
  }

  async getMapAttendance(user: DefaultUserResponse) {
    const userMetaData = await this.userService.fetchStudentMetaDataFromRedisOrDB(user);
    if (!userMetaData) return [];
    return attendanceMetaDataMap(userMetaData);
  }

  async getMapMarks(user: DefaultUserResponse) {
    const userMetaData = await this.userService.fetchStudentMetaDataFromRedisOrDB(user);

    if (!userMetaData) return [];

    return marksMetaDataMap(userMetaData);
  }

  async getFee() {
    let fees = await this.feeRepository.find();
    const presignedUrlPromises = [];
    for (let feeItem of fees) {
      if (feeItem && feeItem.url) {
        const feeItemUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(feeItem.url)
          .then((url) => {
            feeItem.url = url;
          });
        presignedUrlPromises.push(feeItemUrlPromise);
      }
    }
    await Promise.all(presignedUrlPromises);
    return fees;
  }

  async getStudentFeeByUserId(studentDetailId: number) {
    try {
      let response = await axios.get(studentFeesEndpoint(studentDetailId), {
        headers: {
          'X-Api-Key': `${process.env.APTRACK_API_KEY}`,
        },
      });

      if (response.status === 200 && response?.data?.feeData) {
        return response.data.feeData;
      } else {
        throw new HttpException(
          `Invalid response from API: ${JSON.stringify(response.data)}`,
          response.status,
        );
      }
    } catch (err) {
      console.log('Error while getting student fee details : ', err.response.data);
      throw new BadRequestException(JSON.stringify(err.response.data.errors));
    }
  }

  async getMapCertificate(user: DefaultUserResponse) {
    const userMetaData = await this.userService.fetchStudentMetaDataFromRedisOrDB(user);

    if (!userMetaData) return [];

    return certificatesMetaDataMap(userMetaData);
  }

  async getCertificateByName(
    user: DefaultUserResponse,
    certificateByNameDto: certificateByNameDto,
  ) {
    let certDetails = null;
    const brand = await this.masterService.getBrandById(user.activeRole.brandId);

    try {
      // extracting certificate filename/basename
      const certFileName = path.basename(certificateByNameDto.certName);

      certDetails = await fetchStudentCertificateByFileName(certFileName, brand.key);
    } catch (error) {
      if (error?.response?.status === 404) {
        throw new NotFoundException('certificate not found');
      }

      throw new Error(
        `unable to fetch student-certificate by cert-name: ${certificateByNameDto.certName} : ${error}`,
      );
    }
    let certItem = null;
    if (getAptrack2BrandIdList().includes(brand.key) && certDetails.length > 0) {
      certItem = certDetails[0]?.PDF?.[0];
    } else {
      certItem = certDetails?.PDF?.[0];
    }

    if (!certItem?.PDFByte) {
      throw new NotFoundException();
    }

    // cert for aptrack2.0
    if (getAptrack2BrandIdList().includes(brand.key)) {
      const signedURL =
        await this.fileUploadService.aptrack2CertificateGenGetObjectPresignedUrl(
          certItem.PDFByte,
        );
      return { certUrl: signedURL };
    }

    const pdfByte = certItem.PDFByte;

    const fileDirPath = `${S3_DIGITAL_LEARNING_CERTIFICATES}/${user.id}/${certItem.Type}`;

    const certificatePdfBuffer = Buffer.from(pdfByte, 'base64');

    const url = await this.fileUploadService
      .uploadFileToS3(
        certificatePdfBuffer,
        `${certificateByNameDto.certName}`,
        fileDirPath,
      )
      .then(async (location) => {
        const url = await this.fileUploadService.generateGetObjectPresignedUrl(
          path.join(fileDirPath, `${certificateByNameDto.certName}`),
        );
        return url;
      })
      .catch((error) => {
        throw error;
      });

    return { certUrl: url };
  }

  async getUpcomingSevenDaysDoSelectExam(email: any, page: number) {
    const DoSelectAPIBaseURL = this.configService.get('doSelect').apiBaseUrl;
    const DoSelectEmailDomain = this.configService.get('doSelect').emailDomain;
    const limit = 30;

    if (email && !email.includes('@onlinevarsity.com')) {
      const emailParts = email.split('@');
      email = `${emailParts[0]}@${DoSelectEmailDomain}`;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Yesterday
    const yesterdayDate = new Date(today);
    yesterdayDate.setUTCDate(today.getUTCDate() - 7);

    // Add 7 days
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setUTCDate(sevenDaysLater.getUTCDate() + 7);

    // Format both dates as "YYYY-MM-DD"
    const formatDate = (date) => date.toISOString().split('T')[0];

    const startDateTime = formatDate(yesterdayDate);
    const expiryDateTime = formatDate(sevenDaysLater);

    let doSelectUrl = `${DoSelectAPIBaseURL}invite?limit=${limit}&start_time__gte=${startDateTime}T00:00:00Z&expiry__lte=${expiryDateTime}T00:00:00Z`;
    if (email) {
      doSelectUrl = `${doSelectUrl}&email=${email}`;
    }
    if (page && page > 0) {
      const offset = limit * page;
      doSelectUrl = `${doSelectUrl}&offset=${offset}`;
    }

    const tests = await getDoSelectTestsEndpoint(doSelectUrl, page);
    const responseData = { tests: [], total_count: 0 };
    if (tests) {
      const updatedTests = [];

      if (tests.objects.length > 0) {
        for (const test of tests.objects) {
          const testURL = test.test.split('/');
          const slug = testURL[testURL.length - 1];
          const hash = crypto
            .createHmac('sha256', this.configService.get('doSelect').apiSecret)
            .update(email)
            .digest('hex');
          const newTestObject = {
            email: email,
            expiry: test.expiry,
            start_time: test.start_time,
            test_name: test.test_name,
            slug: slug,
            hash: hash,
          };
          updatedTests.push(newTestObject);
        }
      }

      responseData.tests = updatedTests;
      responseData.total_count = tests.meta.total_count;
    }
    return responseData;
  }

  async getBCReceiptEncryptedURL(user: DefaultUserResponse, bcReceiptDto: bcReceiptDto) {
    const brand = await this.masterService.getBrandById(user.activeRole.brandId);
    const BCReceiptToken = encryptBcReceiptPayload({
      brandKey: brand.key,
      invoiceId: bcReceiptDto.Invoice_Header_ID,
      userId: user.userId,
    });

    return {
      action: process.env.BC_RECEIPT_BASE_URL,
      receiptToken: BCReceiptToken,
    };
  }

  async generateBCReceiptSignedUrl(
    user: DefaultUserResponse,
    bcReceiptDto: bcReceiptDto,
  ) {
    const userMetaData = await this.userMetaDataRepository.findOne({
      where: { userId: user.id },
    });

    if (!userMetaData) {
      throw new BusinessException("couldn't fetch BC receipt please try again later!");
    }

    let userPGMetaDataByInvoiceHeaderId: IAptrackStudentPGMetaData = null;

    if (userMetaData.pgMetaData && Array.isArray(userMetaData.pgMetaData)) {
      userPGMetaDataByInvoiceHeaderId = userMetaData.pgMetaData.find(
        (meta) => meta.Invoice_Header_ID === bcReceiptDto.Invoice_Header_ID,
      );
    }

    if (!userPGMetaDataByInvoiceHeaderId) {
      throw new BusinessException("couldn't fetch BC receipt please try again later!");
    }

    const doc = await generatedBCReceiptPdfFile({
      StudentDetailId: parseInt(userPGMetaDataByInvoiceHeaderId.Student_Detail_ID),
      CentreId: userPGMetaDataByInvoiceHeaderId.CenterId,
      BCParentId: bcReceiptDto.Invoice_Header_ID,
    });

    const fileDirPath = `${S3_BC_RECEIPT}/${user.id}`;
    const fileName = `${user.userId}-${userPGMetaDataByInvoiceHeaderId.BCNo}.pdf`;
    const bcReceiptPdfBuffer = Buffer.from(doc, 'base64');

    const url = await this.fileUploadService
      .uploadFileToS3(bcReceiptPdfBuffer, fileName, fileDirPath)
      .then(async (location) => {
        const url = await this.fileUploadService.generateGetObjectPresignedUrl(
          path.join(fileDirPath, fileName),
        );
        return url;
      })
      .catch((error) => {
        throw error;
      });

    return url;
  }
}
