import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyQueryDto } from './dto/company-query.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('list')
  getCompanyList(name: string, @Query() queryDto: CompanyQueryDto) {
    try {
      const searchKeys = ['companyName'];
      return this.companyService.getCompanyList(queryDto, searchKeys);
    } catch (error) {
      console.log('getCompanyList', error);
      throw error;
    }
  }
}
