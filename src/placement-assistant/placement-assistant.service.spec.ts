import { Test, TestingModule } from '@nestjs/testing';
import { PlacementAssistantService } from './placement-assistant.service';

describe('PlacementAssistantService', () => {
  let service: PlacementAssistantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlacementAssistantService],
    }).compile();

    service = module.get<PlacementAssistantService>(PlacementAssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
