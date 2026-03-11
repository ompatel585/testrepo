import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseMappingInterceptor } from './common/interceptor/responseMapping.interceptor';
import { ErrorMappingInterceptor } from './common/interceptor/errorMapping.interceptor';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.set('trust proxy', 1);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalInterceptors(
    new ResponseMappingInterceptor(),
    new ErrorMappingInterceptor(),
  );

  /**
   * @stopAtFirstError is used to stop validation after encountering the first error
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
    }),
  );
  const corsOptions: CorsOptions = {
    origin: true,
    credentials: true,
  };
  const configService = app.get(ConfigService);
  const port = configService.get('serverConfig').PORT;

  app.enableCors(corsOptions);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Student Portal API Docs')
    .setDescription('Student Portal API Docs description')
    .setVersion('1.0')
    .addTag('Student Portal')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apiDocs', app, document);

  await app.listen(port);
  console.log('Server started on port ' + port);

  // show all routes
  /* const router = app.getHttpAdapter().getInstance();

  const routes = router._router.stack
    .filter((layer) => layer.route)
    .map((layer) => {
      const route = layer.route;
      const method = Object.keys(route.methods)[0].toUpperCase();
      return `${method} ${route.path}`;
    });

  console.dir(routes, { maxArrayLength: null }); */
}
bootstrap();
