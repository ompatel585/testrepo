import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/common/entities/company.entity';
import { Repository } from 'typeorm';
import { CompanyQueryDto } from './dto/company-query.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { S3_COMPANY } from 'src/common/constants';
import { generateUniqueFileName } from 'src/common/helper/file.helper';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private fileUploadService: FileUploadService,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto) {
    let company = this.companyRepository.create(createCompanyDto);
    company = await this.companyRepository.save(company);
    let companyId = company.id;

    let attachmentPresignedUrls = [];

    if (createCompanyDto.companyLogo) {
      const s3Key = `${S3_COMPANY}/${company.id}/${generateUniqueFileName(createCompanyDto.companyLogo?.fileName)}`;
      const presignedUrl =
        await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);
      attachmentPresignedUrls.push({
        ...createCompanyDto.companyLogo,
        presignedUrl: presignedUrl.url,
      });
      company.logoImage = s3Key;
      await this.companyRepository.save(company);
    }
    return { companyId, attachmentPresignedUrls };
  }

  async getCompanyList(queryParams: CompanyQueryDto, searchKeys?: string[]) {
    let listQuery = this.companyRepository.createQueryBuilder('company');

    listQuery = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: listQuery,
      searchKeys: searchKeys,
    });

    const [companies, count] = await listQuery.getManyAndCount();

    const presignedUrlPromises = [];

    for (const company of companies) {
      // Adding presigned URL for thumbnail
      if (company.logoImage) {
        const logoUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(company.logoImage)
          .then((url) => {
            company.logoImage = url;
          });
        presignedUrlPromises.push(logoUrlPromise);
      }
    }

    await Promise.all(presignedUrlPromises);
    return {
      companies,
      count,
    };
  }
}
