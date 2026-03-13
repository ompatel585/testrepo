import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InfrastructureReviewNominationController } from './infrastructure-review-nomination.controller';
import { InfrastructureReviewNominationService } from './infrastructure-review-nomination.service';

import { InfrastructureReviewNomination } from '../../common/entities/infrastructure-review-nomination.entity';
import { Brand } from '../../common/entities/brand.entity';
import { Centre } from '../../common/entities/centre.entity';
import { InfrastructureReviewTemplate } from '../../common/entities/infrastructure-review-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InfrastructureReviewNomination,
      Brand,
      Centre,
      InfrastructureReviewTemplate,
    ]),
  ],
  controllers: [InfrastructureReviewNominationController],
  providers: [InfrastructureReviewNominationService],
  exports: [InfrastructureReviewNominationService],
})
export class InfrastructureReviewNominationModule {}