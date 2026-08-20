import { Injectable } from '@nestjs/common';
import { DiscordLogsService } from './discord-logs.service'; // <-- Importamos tu servicio de logs

@Injectable()
export class AppService {
  // Inyectamos el servicio aquí para obligar a NestJS a instanciarlo en el arranque
  constructor(private readonly discordLogsService: DiscordLogsService) {}

  getHello(): string {
    return 'Koshi Village Bot Operativo!';
  }
}