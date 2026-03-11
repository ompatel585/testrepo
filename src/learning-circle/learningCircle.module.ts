import { Module } from '@nestjs/common';
import { LearningCircleController } from './learningCircle.controller';
import { LearningCircle } from 'src/common/entities/learningCircle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLearningCircleModule } from 'src/admin/learning-circle/admin-learningCircle.module';
import { MasterModule } from 'src/master/master.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningCircle]),
    AdminLearningCircleModule,
    MasterModule,
    UsersModule,
  ],
  controllers: [LearningCircleController],
  providers: [],
})
export class LearningCircleModule {}
