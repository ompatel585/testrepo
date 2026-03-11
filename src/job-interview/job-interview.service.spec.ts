import { Test, TestingModule } from '@nestjs/testing';
import { JobInterviewService } from './job-interview.service';

describe('JobInterviewService', () => {
  let service: JobInterviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobInterviewService],
    }).compile();

    service = module.get<JobInterviewService>(JobInterviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
