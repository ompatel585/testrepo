import { Test, TestingModule } from '@nestjs/testing';
import { LearningCircleController } from './learningCircle.controller';

describe('LearningCircleController', () => {
  let controller: LearningCircleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningCircleController],
    }).compile();

    controller = module.get<LearningCircleController>(LearningCircleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
