import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureParametersController } from './infrastructure-parameters.controller';
import { InfrastructureParametersService } from './infrastructure-parameters.service';
import { InfrastructureCategory } from './entities/infrastructure-category.entity';
import { InfrastructureParameter } from './entities/infrastructure-parameter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InfrastructureCategory,
      InfrastructureParameter,
    ]),
  ],
  controllers: [InfrastructureParametersController],
  providers: [InfrastructureParametersService],
  exports: [InfrastructureParametersService],
})
export class InfrastructureParametersModule {}

