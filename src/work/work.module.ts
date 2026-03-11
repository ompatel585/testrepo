import { forwardRef, Module } from '@nestjs/common';
import { WorkService } from './work.service';
import { WorkController } from './work.controller';
import { Work } from 'src/common/entities/work.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkHistoryService } from './work-history.service';
import { WorkHistory } from 'src/common/entities/work-history.entity';
import { Files } from 'src/common/entities/files.entity';
import { FileService } from './file.service';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { FacultyController } from './work.faculty.controller';
import { Portfolio } from 'src/common/entities/portfolio.entity';
import { WorkView } from 'src/common/entities/workView.entity';
import { WorkLike } from 'src/common/entities/workLike.entity';
import { WorkComment } from 'src/common/entities/workComment.entity';
import { Follow } from 'src/common/entities/follow.entity';
import { CenterEmployeeWorkController } from './center-employee-work.controller';
import { CentreEmployeeWorkService } from './centre-employee-work.service';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Files,
      Work,
      WorkHistory,
      Portfolio,
      WorkView,
      WorkLike,
      WorkComment,
      Follow,
      User,
    ]),
    FileUploadModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [WorkController, FacultyController, CenterEmployeeWorkController],
  providers: [WorkService, WorkHistoryService, FileService, CentreEmployeeWorkService],
  exports: [WorkService],
})
export class WorkModule {}
