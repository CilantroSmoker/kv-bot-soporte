import { Injectable, Logger } from '@nestjs/common';
import { Client, ChannelType } from 'discord.js';
import { LevelTitleService } from './level-title.service';

@Injectable()
export class LevelUpNotificationService {
  private readonly logger = new Logger(LevelUpNotificationService.name);
  private readonly CHANNEL_ID = '1538783310954762301';

  constructor(private levelTitle: LevelTitleService) {}

  async notifyLevelUp(
    client: Client,
    discordId: string,
    username: string,
    newLevel: number,
  ): Promise<void> {
    try {
      const channel = await client.channels.fetch(this.CHANNEL_ID);

      if (!channel || channel.type !== ChannelType.GuildText) {
        this.logger.error('Canal de niveles no válido');
        return;
      }

      const rankUpInfo = this.levelTitle.getRankUpTitle(newLevel);

      let message: string;

      if (rankUpInfo) {
        message = `🎉 <@${discordId}> ha alcanzado el nivel ${newLevel}\n${rankUpInfo.emoji} ¡Ha ascendido al rango **${rankUpInfo.title}**!`;
      } else {
        const nextTitle = this.levelTitle.getNextTitleByLevel(newLevel);

        message = `🗡 <@${discordId}> ha alcanzado el nivel ${newLevel}\n⚔ Se acerca más a ser un "${nextTitle}"`;
      }

      await channel.send(message);

      this.logger.log(
        `Notificación de level-up enviada para ${username} (nivel ${newLevel})`,
      );
    } catch (error) {
      this.logger.error('Error enviando notificación de level-up', error);
    }
  }
}
