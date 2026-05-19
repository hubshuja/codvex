import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://codvex.net'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'client'));

  // ✅ SPA fallback as middleware — runs AFTER all controllers
  app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(join(__dirname, '..', 'client', 'index.html'));
    } else {
      next();
    }
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();