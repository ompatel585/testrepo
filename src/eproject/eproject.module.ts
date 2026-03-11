import { Module } from '@nestjs/common';
import { EprojectService } from './eproject.service';
import { EprojectController } from './eproject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EProject } from 'src/common/entities/eproject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EProject])],
  providers: [EprojectService],
  controllers: [EprojectController],
})
export class EprojectModule {}
