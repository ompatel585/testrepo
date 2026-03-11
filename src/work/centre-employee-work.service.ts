import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Work } from 'src/common/entities/work.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from './file.service';
import { UpdateWorkReviewerDto } from './dto/update-work-reviewer.dto';
import { User } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enum/role.enum';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CentreEmployeeWorkService {
  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private usersService: UsersService,

    private fileService: FileService,
  ) {}

  // async workById(workId: number, user: any): Promise<Work> {
  //   let work = await this.workRepository.findOne({
  //     where: { id: workId, user: { centreId: user.centreId } },
  //   });

  //   if (!work) throw new NotFoundException();

  //   const files = await this.fileService.getFilesByWork(workId, work.version);
  //   work.files = files;
  //   return work;
  // }

  // async updateWorkReviewer(user: any, updateWorkReviewerDto: UpdateWorkReviewerDto) {
  //   // check for valid faculty
  //   const faculty = await this.userRepository.findOneBy({
  //     id: updateWorkReviewerDto.reviewerId,
  //   });

  //   if (faculty.centreId != user.centreId || faculty.brandId != user.brandId) {
  //     throw new BusinessException('invalid reviewer');
  //   }

  //   // fetch filtered work
  //   const selectQuery = this.workRepository
  //     .createQueryBuilder('work')
  //     .leftJoin('work.user', 'user')
  //     .where('work.id In (:...workIds)', { workIds: updateWorkReviewerDto.workIds })
  //     .andWhere('work.status = :status', { status: updateWorkReviewerDto.status })
  //     .andWhere('"user"."centreId" = :centreId', { centreId: user.centreId })
  //     .andWhere('"user"."brandId" = :brandId', { brandId: user.brandId });

  //   const workList = await selectQuery.select('work.id').getMany();

  //   // update reviewer of filtered works
  //   if (workList.length != updateWorkReviewerDto.workIds.length) {
  //     throw new BadRequestException('Please provide valid works!');
  //   }
  //   return await this.workRepository
  //     .createQueryBuilder('work')
  //     .update(Work)
  //     .set({ reviewerId: updateWorkReviewerDto.reviewerId })
  //     .where('id In (:...workIds)', { workIds: updateWorkReviewerDto.workIds })
  //     .execute();
  // }
}
