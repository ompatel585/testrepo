import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventService } from './event.service';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { Logger } from '@nestjs/common';
import { UpdateEventDto } from './dto/update-event.dto';

// @Roles(Role.Admin)
@Controller('events')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateEventDto) {
    try {
      const event = await this.eventService.createEvent(dto);
      return new ResponseHelper(event);
    } catch (error) {
      console.error('EventController->create', error);
      throw error;
    }
  }

  @Get('categories/:id')
  async getEventCategoriesByBrandId(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    brandId: number,
  ) {
    try {
      const events = await this.eventService.getEventCategoriesByBrandId(brandId);
      return new ResponseHelper(events);
    } catch (error) {
      console.error('EventController->getAllEvents', error);
      throw error;
    }
  }

  @Get('get-events')
  async getAllEvents() {
    try {
      const events = await this.eventService.getEvents();
      return new ResponseHelper(events);
    } catch (error) {
      console.error('EventController->getAllEvents', error);
      throw error;
    }
  }
  @Get('get-event/:id')
  async getEventCategoryData(
    @Req() req: any,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    eventId: number,
  ) {
    try {
      const eventCategoryData = await this.eventService.getEventById(req.user, eventId);
      return new ResponseHelper(eventCategoryData);
    } catch (error) {
      this.logger.error(error);
      return new ResponseHelper(
        'Failed to fetch event category data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [error.message],
      );
    }
  }

  @Delete('delete-event/:id')
  async softDeleteEvent(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
    eventId: number,
  ) {
    try {
      await this.eventService.softDeleteEvent(eventId);
      return new ResponseHelper('Event marked as INACTIVE');
    } catch (error) {
      this.logger.error(error);
      return new ResponseHelper(
        'Failed to delete event',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [error.message],
      );
    }
  }
  @Put(':id')
  updateEvent(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.eventService.updateEvent(id, dto);
  }
}
