import { Test, TestingModule } from '@nestjs/testing';
import { PlacementAssistantController } from './placement-assistant.controller';
import { PlacementAssistantService } from './placement-assistant.service';

describe('PlacementAssistantController', () => {
  let controller: PlacementAssistantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacementAssistantController],
      providers: [PlacementAssistantService],
    }).compile();

    controller = module.get<PlacementAssistantController>(PlacementAssistantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
