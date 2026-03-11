import { Module } from '@nestjs/common';
import { LearningCircle } from 'src/common/entities/learningCircle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLearningCircleController } from './admin-learningCircle.controller';
import { AdminLearningCircleService } from './admin-learningCircle.service';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { TaxonomyBrand } from 'src/common/entities/taxonomyBrand.entity';
import { TaxonomyMapping } from 'src/common/entities/taxonomyMapping.entity';
import { TaxonomyBrandCategory } from 'src/common/entities/taxonomyBrandCategory.entity';
import { UsersModule } from 'src/users/users.module';
import { UserRole } from 'src/common/entities/userRole.entity';
// import { TaxonomyBrand } from 'src/common/entities/taxonomyBrand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningCircle,
      TaxonomyBrand,
      TaxonomyMapping,
      TaxonomyBrandCategory,
      UserRole,
    ]),
    FileUploadModule,
    UsersModule,
  ],
  controllers: [AdminLearningCircleController],
  providers: [AdminLearningCircleService],
  exports: [AdminLearningCircleService],
})
export class AdminLearningCircleModule {}
