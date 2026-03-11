import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { TestMiddleware } from './common/middleware/test.middleware';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthJwtGuard } from './common/guard/auth-jwt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig, jwtConfig, serverConfig, doSelect } from './common/config';
import { IsAlreadyExistConstraint } from './common/validation/isAlreadyExists';
import { OtpModule } from './otp/otp.module';
import { LoggingMiddleware } from './common/middleware/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './common/guard/roles.guard';
import { ProfileModule } from './profile/profile.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { WorkModule } from './work/work.module';
import { MasterModule } from './master/master.module';
import { IsExistConstraint } from './common/validation/isExists';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationModule } from './notification/notification.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { CoursesModule } from './course/courses.module';
import { LearningCircleModule } from './learning-circle/learningCircle.module';
import { AcademicModule } from './academic/academic.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { CloudLoggerModule } from './cloud-logger/cloud-logger.module';
import { JobModule } from './job/job.module';
//import { JobApplicationModule } from './job-application/job-application.module';
import { JobInterviewModule } from './job-interview/job-interview.module';
import { PlacementAssistantModule } from './placement-assistant/placement-assistant.module';
import { HomePageModule } from './homepage/homepage.module';
import { CompanyModule } from './company/company.module';
import { FeedModule } from './feed/feed.module';
import { ImageProcessorModule } from './imageProcessor/imageProcessor.module';
import { AdminLearningCircleModule } from './admin/learning-circle/admin-learningCircle.module';
import { IsExistInArrayConstraint } from './common/validation/isExistInArray.constrain';
import { CustomCacheModule } from './cache/custom-cache.module';
import { BookModule } from './admin/book/book.module';
import { PaymentModule } from './payment/payment.module';
import { UserActivityModule } from './user-activity/userActivity.module';
import { GlobalExceptionsFilter } from './common/exceptions/global.exception.filter';
import { AdminAccessControlModule } from './admin/access-control/admin-access-control.module';
import envConfig from './common/config/env.config';
import { SqsModule } from './sqs/sqs.module';
import { SubmissionModule } from './event/eventSubmission/eventSubmission.module';
import { EventModule } from './event/event.module';
import { CentreWallModule } from './event/CentreWall/centreWall.module';
import { DatabaseInitModule } from './database/database-initialization.module';
import { DrmModule } from './admin/drm/drm.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WinnerDashboardModule } from './event/WinnerDashboard/winnerDashboard.module';
import { AssignRatingModule } from './event/ratingAssign/rating-assign.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { EprojectModule } from './eproject/eproject.module';
import { ReportModule } from './admin/report/report.module';
import redisConfig from './common/config/redis.config';
import { InfrastructureParametersModule } from './Infrastructure/Parameters/infrastructure-parameters.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CatsModule,
    AuthModule,
    UsersModule,
    OtpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        // logging: ['query', 'error', 'warn', 'schema', 'migration', 'log'],
        // logger: 'advanced-console',
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envConfig().envFilePath,
      ignoreEnvFile: envConfig().ignoreEnvFile,
      load: [envConfig, DatabaseConfig, jwtConfig, serverConfig, doSelect, redisConfig],
    }),
    ProfileModule,
    // MulterModule.register({
    //   dest: 'upload',
    // }),
    FileUploadModule,
    WorkModule,
    PortfolioModule,
    MasterModule,
    NotificationModule,
    CoursesModule,
    LearningCircleModule,
    AcademicModule,
    TestimonialModule,
    CloudLoggerModule,
    JobModule,
    //    JobApplicationModule,
    JobInterviewModule,
    PlacementAssistantModule,
    HomePageModule,
    CompanyModule,
    FeedModule,
    ImageProcessorModule,
    AdminLearningCircleModule,
    CustomCacheModule,
    RedisCacheModule,
    BookModule,
    PaymentModule,
    UserActivityModule,
    AdminAccessControlModule,
    SqsModule,
    EventModule,
    CentreWallModule,
    SubmissionModule,
    DatabaseInitModule,
    DrmModule,
    WinnerDashboardModule,
    AssignRatingModule,
    EprojectModule,
    ReportModule,
    InfrastructureParametersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthJwtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    IsAlreadyExistConstraint,
    IsExistConstraint,
    IsExistInArrayConstraint,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TestMiddleware).forRoutes('cats');
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
