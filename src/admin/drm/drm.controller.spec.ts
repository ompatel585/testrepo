import { Test, TestingModule } from '@nestjs/testing';
import { DrmController } from './drm.controller';
import { DrmService } from './drm.service';

describe('DrmController', () => {
  let controller: DrmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrmController],
      providers: [DrmService],
    }).compile();

    controller = module.get<DrmController>(DrmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
