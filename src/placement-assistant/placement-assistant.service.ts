import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlacementAssistantDto } from './dto/create-placement-assistant.dto';
import { UpdatePlacementAssistantDto } from './dto/update-placement-assistant.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { User } from 'src/common/entities/user.entity';
import { PlacementAssistant } from 'src/common/entities/placementAssistant.entity';
import { S3_PLACEMENT_ASSISTANT } from 'src/common/constants';
import { Profile } from 'src/common/entities/profile.entity';

@Injectable()
export class PlacementAssistantService {
  constructor(
    @InjectRepository(PlacementAssistant)
    private placementAssistantRepository: Repository<PlacementAssistant>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    private fileUploadService: FileUploadService,
  ) {}

  async create(user: any, createPlacementAssistantDto: CreatePlacementAssistantDto) {
    user = new User({ id: user.id });
    let placementAssistant = this.placementAssistantRepository.create({
      ...createPlacementAssistantDto,
      user,
    });

    const result = await this.placementAssistantRepository.save(placementAssistant);

    const s3AttachmentlKey = `${S3_PLACEMENT_ASSISTANT}/${result.id}/${createPlacementAssistantDto.attachmentFile}`;

    const attachmentPresignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3AttachmentlKey);
    placementAssistant.attachmentFile = s3AttachmentlKey;
    placementAssistant = await this.placementAssistantRepository.save(placementAssistant);

    await this.profileRepository
      .createQueryBuilder()
      .update(Profile)
      .set({ registeredPlacement: createPlacementAssistantDto.isConfirmPlacement })
      .where('id = :userId', { userId: user.id })
      .execute();

    return { attachmentPresignedUrl };
  }

  findAll() {
    return `This action returns all placementAssistant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} placementAssistant`;
  }

  update(id: number, updatePlacementAssistantDto: UpdatePlacementAssistantDto) {
    return `This action updates a #${id} placementAssistant`;
  }

  remove(id: number) {
    return `This action removes a #${id} placementAssistant`;
  }
}
