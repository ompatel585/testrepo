import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InfrastructureParametersController } from './infrastructure-parameters.controller';
import { InfrastructureParametersService } from './infrastructure-parameters.service';

import { InfrastructureParameter } from '../../common/entities/infrastructure-parameter.entity';
import { InfrastructureSubParameter } from '../../common/entities/infrastructure-sub-parameter.entity';
import { InfrastructureCategory } from '../../common/entities/infrastructure-category.entity';
import { Brand } from '../../common/entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InfrastructureParameter,
      InfrastructureSubParameter,
      InfrastructureCategory,
      Brand,
    ]),
  ],
  controllers: [InfrastructureParametersController],
  providers: [InfrastructureParametersService],
  exports: [InfrastructureParametersService],
})
export class InfrastructureParametersModule {}