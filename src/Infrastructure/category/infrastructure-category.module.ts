import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureCategory } from 'src/common/entities/infrastructure-category.entity';
import { InfrastructureCategoryService } from './infrastructure-category.service';
import { InfrastructureCategoryController } from './infrastructure-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfrastructureCategory])],
  controllers: [InfrastructureCategoryController],
  providers: [InfrastructureCategoryService],
})
export class InfrastructureCategoryModule {}