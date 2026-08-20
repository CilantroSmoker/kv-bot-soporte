import * as dotenv from 'dotenv';
dotenv.config(); 

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DiscordLogsService } from './discord-logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const discordLogsService = app.get(DiscordLogsService);

  await app.listen(process.env.PORT ?? 3000);

  setTimeout(() => {
    discordLogsService.sendCustomLog(
      '🚀 Servidor Iniciado',
      `El servidor está corriendo en puerto ${process.env.PORT ?? 3000}`,
      0x2ecc71
    );
  }, 2000); // 2 segundos para que el bot se conecte
}

bootstrap();