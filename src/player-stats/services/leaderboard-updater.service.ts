import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeaderboardsReaderService } from './leaderboards-reader.service';
import { DiscordService } from '../../discord.service';
import {
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

@Injectable()
export class LeaderboardUpdaterService {
  private readonly logger = new Logger(LeaderboardUpdaterService.name);

  constructor(
    private readonly leaderboardsReader: LeaderboardsReaderService,
    private readonly discordService: DiscordService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('*/30 * * * * *')
  async updateDailyLeaderboards(): Promise<void> {
    this.logger.log('⏱ Actualizando rankings diarios...');

    const channelId = this.configService.get<string>(
      'LEADERBOARD_DAILY_CHANNEL_ID',
    );

    const timeMessageId = this.configService.get<string>(
      'LEADERBOARD_DAILY_TIME_MESSAGE_ID',
    );

    const killsMessageId = this.configService.get<string>(
      'LEADERBOARD_DAILY_KILLS_MESSAGE_ID',
    );

    const moneyMessageId = this.configService.get<string>(
      'LEADERBOARD_DAILY_MONEY_MESSAGE_ID',
    );

    if (
      !channelId ||
      !timeMessageId ||
      !killsMessageId ||
      !moneyMessageId
    ) {
      this.logger.error(
        '❌ Faltan IDs de los rankings diarios en .env',
      );
      return;
    }

    try {
      const channel = await this.discordService.fetchTextChannel(channelId);

      if (!channel) {
        this.logger.error(
          `❌ No se encontró el canal de rankings diarios: ${channelId}`,
        );
        return;
      }

      await this.updateLeaderboardMessage(
        channel,
        timeMessageId,
        'time',
        '⏱️ Tiempo Jugado',
      );

      await this.updateLeaderboardMessage(
        channel,
        killsMessageId,
        'kills',
        '⚔️ Player Kills',
      );

      await this.updateLeaderboardMessage(
        channel,
        moneyMessageId,
        'money',
        '💰 Balance',
      );

      this.logger.log('✅ Rankings diarios actualizados correctamente.');
    } catch (error) {
      this.logger.error(
        '❌ Error actualizando rankings diarios',
        error,
      );
    }
  }

  private async updateLeaderboardMessage(
    channel: TextChannel,
    messageId: string,
    type: 'time' | 'kills' | 'money',
    title: string,
  ): Promise<void> {
    try {
      const leaderboard = await this.leaderboardsReader.getLeaderboard(
        type,
        'daily',
        10,
      );

      if (!leaderboard.length) {
        this.logger.warn(
          `⚠ No hay datos para el ranking ${type}.`,
        );
        return;
      }

      const message = await channel.messages.fetch(messageId);

      const medals = ['🥇', '🥈', '🥉'];

      const fields = leaderboard.map((entry, i) => {
        const medal = medals[i] || '';

        let value = '';

        if (type === 'time') {
          const hours = entry.score / 3600;

          value = `${hours
            .toFixed(1)
            .replace('.', ',')} horas`;
        } else if (type === 'money') {
          value = `$${entry.score.toLocaleString('es-CL')} monedas`;
        } else if (type === 'kills') {
          value = `${entry.score.toLocaleString('es-CL')} jugadores asesinados`;
        }

        return {
          name: `${medal} #${entry.position} ${entry.playerName}`,
          value,
          inline: true,
        };
      });

      const embed = new EmbedBuilder()
        .setTitle(`🏆 ${title} - Diario`)
        .setColor(0xffd700)
        .addFields(fields)
        .setTimestamp();

      await message.edit({
        embeds: [embed],
      });

      this.logger.log(
        `✅ Ranking ${type} actualizado. Mensaje: ${messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error actualizando ranking ${type}. Mensaje: ${messageId}`,
        error,
      );
    }
  }
}
