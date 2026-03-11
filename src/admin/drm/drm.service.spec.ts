import { Test, TestingModule } from '@nestjs/testing';
import { DrmService } from './drm.service';

describe('DrmService', () => {
  let service: DrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrmService],
    }).compile();

    service = module.get<DrmService>(DrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
