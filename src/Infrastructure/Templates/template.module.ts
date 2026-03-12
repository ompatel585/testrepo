import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

import { InfrastructureReviewTemplate } from 'src/common/entities/infrastructure-review-template.entity';
import { InfrastructureParameter } from 'src/common/entities/infrastructure-parameter.entity';
import { InfrastructureCategory } from 'src/common/entities/infrastructure-category.entity';
import { InfrastructureSubParameter } from 'src/common/entities/infrastructure-sub-parameter.entity';
import { Brand } from 'src/common/entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InfrastructureReviewTemplate,
      InfrastructureParameter,
      InfrastructureCategory,
      InfrastructureSubParameter,
      Brand
    ]),
  ],
  providers: [TemplateService],
  controllers: [TemplateController],
})
export class TemplateModule {}