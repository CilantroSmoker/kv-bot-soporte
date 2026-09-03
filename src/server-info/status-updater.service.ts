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

	    try {
	      if (!this.discordService.isReady()) {
	  this.logger.warn('⚠ DiscordService todavía no está listo.');
	  return;
	}


      const status =
        await this.serverStatusService.getServerStatus();


      await this.discordService.updateServerStatusEmbed(status);


    } catch (error) {
      this.logger.error(
        'Error actualizando estado del servidor',
        error,
      );
    }
  }
}
