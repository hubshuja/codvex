import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', 'client'));

  await app.listen(process.env.PORT || 4000);
  console.log(`🚀 Codvex running on: http://localhost:${process.env.PORT || 4000}`);
}
bootstrap();