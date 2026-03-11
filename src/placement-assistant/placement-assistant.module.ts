import { Module } from '@nestjs/common';
import { PlacementAssistantService } from './placement-assistant.service';
import { PlacementAssistantController } from './placement-assistant.controller';
import { PlacementAssistant } from 'src/common/entities/placementAssistant.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/common/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlacementAssistant, Profile]), FileUploadModule],

  controllers: [PlacementAssistantController],
  providers: [PlacementAssistantService],
  exports: [PlacementAssistantService],
})
export class PlacementAssistantModule {}
