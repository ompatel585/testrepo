import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { AuthLocalGuard } from 'src/common/guard/auth-local.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(AuthLocalGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile(); // Override AuthLocalGuard to mock its behavior

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return the result of authService.login', async () => {
      const user = { username: 'test', password: 'password' };

      const expectedResult = {
        access_token: '123',
      };

      (authService.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.login({ user });
      expect(result).toBe(expectedResult);
    });

    it('should throw BadRequestException if user data is missing', async () => {
      const user = { username: '', password: '' };

      const expectedResult = {
        access_token: '123',
      };

      (authService.login as jest.Mock).mockImplementation(
        (user: { username: string; password: string }) => {
          if (user?.username && user?.password) {
            return expectedResult;
          }
          throw new BadRequestException('Invalid user data');
        },
      );
      await expect(controller.login(user)).rejects.toThrow(BadRequestException);
    });
  });
});
