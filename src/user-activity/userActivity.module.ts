import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from 'src/common/entities/userActivity.entity';
import { UserActivityService } from './userActivity.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivity])],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
