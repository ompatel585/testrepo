import { Test, TestingModule } from '@nestjs/testing';
import { JobInterviewController } from './job-interview.controller';
import { JobInterviewService } from './job-interview.service';

describe('JobInterviewController', () => {
  let controller: JobInterviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobInterviewController],
      providers: [JobInterviewService],
    }).compile();

    controller = module.get<JobInterviewController>(JobInterviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
