import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { ServerStatus } from './server-status.interface';
import { minecraftPing } from '../minecraft/minecraft-ping';

@Injectable()
export class ServerStatusService {
  private readonly logger = new Logger(ServerStatusService.name);

  private readonly pterodactylUrl: string;
  private readonly pterodactylKey: string;
  private readonly serverId: string;
  private readonly publicIp: string;
  private readonly javaServer: string;
  private readonly javaVersion: string;
  private readonly bedrockVersion: string;
  private lastOnlineStatus: boolean | null = null;
  private offlineSince: Date | null = null;

  constructor(private readonly configService: ConfigService) {
    this.pterodactylUrl =
      this.configService.get<string>('PTERODACTYL_URL') ?? '';

    this.pterodactylKey =
      this.configService.get<string>('PTERODACTYL_API_KEY') ?? '';

    this.serverId =
      this.configService.get<string>('PTERODACTYL_SERVER_ID') ?? '';

    this.javaServer =
     this.configService.get<string>('JAVA_SERVER') ??
     '127.0.0.1:25601';

   this.publicIp = 
     this.configService.get<string>('PUBLIC_SERVER_IP') ?? 
     'play.koshivillage.online';

    this.javaVersion =
      this.configService.get<string>('JAVA_VERSION') ?? '26.2';

    this.bedrockVersion =
      this.configService.get<string>('BEDROCK_VERSION') ?? '26.42';
  }

  async getServerStatus(): Promise<ServerStatus> {
    try {
      const configData = await this.getMainConfFromPterodactyl();

      const { motd, maxPlayers } = this.parseMainConf(configData);

      const serverStatus = await this.getMinecraftStatus();

      return {
        online: serverStatus.online,
        motd,
        maxPlayers,
        players: serverStatus.players,
        latency: serverStatus.latency,
	ip: this.publicIp,
        javaVersion: this.javaVersion,
        bedrockVersion: this.bedrockVersion,
      };
    } catch (error) {
      this.logger.error('Error obteniendo estado del servidor', error);

      throw new Error('No se pudo obtener la información del servidor');
    }
  }

  private async getMinecraftStatus() {
  try {
    const pingData = await minecraftPing(this.javaHost, this.javaPort);

    if (this.lastOnlineStatus !== true) {
      if (this.offlineSince) {
        const duration = Math.floor(
          (Date.now() - this.offlineSince.getTime()) / 1000,
        );
        this.logger.log(`Servidor volvió a estar online (caída: ${duration}s).`);
      } else {
        this.logger.log('Servidor online.');
      }
      this.lastOnlineStatus = true;
      this.offlineSince = null;
    }

    return {
      online: true,
      players: pingData.status.players.online,
      latency: pingData.latency,
    };
  } catch (error: unknown) {
    if (this.lastOnlineStatus !== false) {
      this.logger.warn(
        `Servidor offline: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.lastOnlineStatus = false;
      this.offlineSince = new Date();
    }

    return {
      online: false,
      players: 0,
      latency: 0,
    };
  }
}

  private get javaHost(): string {
    return this.javaServer.split(':')[0];
  }

  private get javaPort(): number {
    const port = parseInt(this.javaServer.split(':')[1], 10);

    if (Number.isNaN(port)) {
      throw new Error(`Puerto inválido: ${this.javaServer}`);
    }

    return port;
  }

  private async getMainConfFromPterodactyl(): Promise<string> {
    try {
      const response = await axios.get(
        `${this.pterodactylUrl}/api/client/servers/${this.serverId}/files/contents`,
        {
          params: {
            file: 'plugins/MiniMOTD/main.conf',
          },
          headers: {
            Authorization: `Bearer ${this.pterodactylKey}`,
            Accept: 'application/json',
          },
        },
      );

      return typeof response.data === 'string'
        ? response.data
        : response.data.attributes.content;
    } catch (error) {
      this.logger.error('Error leyendo main.conf desde Pterodactyl', error);
      throw error;
    }
  }

  private parseMainConf(
    content: string,
  ): { motd: string; maxPlayers: number } {
    try {
      const maxPlayersMatch = content.match(/max-players\s*=\s*(\d+)/);

      const maxPlayers = maxPlayersMatch
        ? parseInt(maxPlayersMatch[1], 10)
        : 100;

      const motdMatch = content.match(/line1="([^"]+)".*?line2="([^"]+)"/s);

      const motd = motdMatch ? `${motdMatch[1]} ${motdMatch[2]}` : 'DREAMS GAMERS';

      return {
        motd: this.stripMinecraftFormatting(motd),
        maxPlayers,
      };
    } catch (error) {
      this.logger.error('Error parseando main.conf', error);

      return {
        motd: 'DREAMS GAMERS',
        maxPlayers: 100,
      };
    }
  }

  private stripMinecraftFormatting(text: string): string {
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/[§][0-9a-fk-or]/g, '')
      .trim();
  }
}
