import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CreateEventWinnerDto } from 'src/event/dto/create-event-winner.dto';
import { EventWinnerService } from './winnerDashboard.service';
import { ResponseHelper } from 'src/common/helper/response.helper';

@Controller('event')

export class EventWinnerController {
  constructor(private readonly eventWinnerService: EventWinnerService) {}

  @Post('winner')
  async createWinner(@Body() dto: CreateEventWinnerDto) {
    try {
      const winner = await this.eventWinnerService.createWinner(dto);
      return new ResponseHelper(winner);
    } catch (error) {
      console.error('EventWinnerController:createWinner:', error);
      throw new BadRequestException(error.message);
    }
  }
}
