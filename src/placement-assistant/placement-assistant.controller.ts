import {
  Controller,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Get,
  ParseIntPipe,
  HttpStatus,
  Req,
  Query,
  Patch,
} from '@nestjs/common';
import { ValidationPipe } from 'src/common/pipes/validation.pipe';
import { Request } from 'express';
import { PlacementAssistantService } from './placement-assistant.service';
import { CreatePlacementAssistantDto } from './dto/create-placement-assistant.dto';
import { UpdatePlacementAssistantDto } from './dto/update-placement-assistant.dto';
import { ResponseHelper } from 'src/common/helper/response.helper';

@Controller('placement-assistant')
export class PlacementAssistantController {
  constructor(private readonly placementAssistantService: PlacementAssistantService) {}

  @Post()
  async createPlacementAssistant(
    @Req() req: Request,
    @Body(new ValidationPipe()) createPlacementAssistantDto: CreatePlacementAssistantDto,
  ) {
    try {
      const data = await this.placementAssistantService.create(
        req.user,
        createPlacementAssistantDto,
      );
      return new ResponseHelper(data);
    } catch (error) {
      console.log('PlacementAssistantController->createPlacementAssistant', error);
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.placementAssistantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placementAssistantService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlacementAssistantDto: UpdatePlacementAssistantDto,
  ) {
    return this.placementAssistantService.update(+id, updatePlacementAssistantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placementAssistantService.remove(+id);
  }
}
