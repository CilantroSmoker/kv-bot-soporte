import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ServerStatusService } from '../services/server-status.service';
import { DiscordService } from '../discord.service';

@Injectable()
export class StatusUpdaterService implements OnModuleInit {

  private readonly logger = new Logger(StatusUpdaterService.name);

  constructor(
    private readonly serverStatusService: ServerStatusService,
    private readonly discordService: DiscordService,
  ) {
    this.logger.log('StatusUpdaterService inicializado');
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(
      'StatusUpdaterService listo. Esperando al intervalo de actualización.',
    );
  }

  @Interval(30000)
  async updateStatus(): Promise<void> {
    this.logger.log('⏱ Ejecutando actualización de Server Status...');

    try {
      if (!this.discordService.isReady()) {
  this.logger.warn('⚠ DiscordService todavía no está listo.');
  return;
}

      this.logger.log('📡 Consultando estado de Minecraft...');

      const status =
        await this.serverStatusService.getServerStatus();

      this.logger.log(
        `📊 Estado recibido: online=${status.online}, players=${status.players}, ping=${status.latency}ms`,
      );

      this.logger.log('📝 Actualizando embed de Server Status...');

      await this.discordService.updateServerStatusEmbed(status);

      this.logger.log('✅ Embed de Server Status actualizado correctamente.');

    } catch (error) {
      this.logger.error(
        'Error actualizando estado del servidor',
        error,
      );
    }
  }
}
