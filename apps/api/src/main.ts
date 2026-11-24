import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 3001 localmente, para não disputar a porta 3000 com o Next.js.
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
