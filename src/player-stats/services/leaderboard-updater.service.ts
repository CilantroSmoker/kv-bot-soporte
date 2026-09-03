import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeaderboardsReaderService } from './leaderboards-reader.service';
import { DiscordService } from '../../discord.service';
import {
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

type LeaderboardType = 'time' | 'kills' | 'money';
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

@Injectable()
export class LeaderboardUpdaterService {
  private readonly logger = new Logger(LeaderboardUpdaterService.name);

  constructor(
    private readonly leaderboardsReader: LeaderboardsReaderService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {}


  @Cron('0 */12 * * *')
   async updateLeaderboards(): Promise<void> {

    try {
      await this.updatePeriod('daily');
      await this.updatePeriod('weekly');
      await this.updatePeriod('monthly');

    } catch (error) {
      this.logger.error(
        '❌ Error actualizando rankings',
        error,
      );
    }
  }

  private async updatePeriod(
    period: LeaderboardPeriod,
  ): Promise<void> {
    const channelId = this.configService.get<string>(
      `LEADERBOARD_${period.toUpperCase()}_CHANNEL_ID`,
    );

    const timeMessageId = this.configService.get<string>(
      `LEADERBOARD_${period.toUpperCase()}_TIME_MESSAGE_ID`,
    );

    const killsMessageId = this.configService.get<string>(
      `LEADERBOARD_${period.toUpperCase()}_KILLS_MESSAGE_ID`,
    );

    const moneyMessageId = this.configService.get<string>(
      `LEADERBOARD_${period.toUpperCase()}_MONEY_MESSAGE_ID`,
    );

    if (
      !channelId ||
      !timeMessageId ||
      !killsMessageId ||
      !moneyMessageId
    ) {
      this.logger.error(
        `❌ Faltan IDs para los rankings ${period}.`,
      );
      return;
    }

    const channel = await this.discordService.fetchTextChannel(channelId);

    if (!channel) {
      this.logger.error(
        `❌ No se encontró el canal de rankings ${period}: ${channelId}`,
      );
      return;
    }

    const periodName = this.getPeriodName(period);

    await this.updateLeaderboardMessage(
      channel,
      timeMessageId,
      'time',
      `⏱ Tiempo Jugado`,
      period,
      periodName,
    );

    await this.updateLeaderboardMessage(
      channel,
      killsMessageId,
      'kills',
      `⚔ Player Kills`,
      period,
      periodName,
    );

    await this.updateLeaderboardMessage(
      channel,
      moneyMessageId,
      'money',
      `💰 Balance`,
      period,
      periodName,
    );
  }

  private async updateLeaderboardMessage(
    channel: TextChannel,
    messageId: string,
    type: LeaderboardType,
    title: string,
    period: LeaderboardPeriod,
    periodName: string,
  ): Promise<void> {
    try {
      const leaderboard =
        await this.leaderboardsReader.getLeaderboard(
          type,
          period,
          10,
        );

      if (!leaderboard.length) {
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
          value = `${entry.score.toLocaleString(
            'es-CL',
          )} jugadores asesinados`;
        }

        return {
          name: `${medal} #${entry.position} ${entry.playerName}`,
          value,
          inline: true,
        };
      });

      const embed = new EmbedBuilder()
        .setTitle(`🏆 ${title} - ${periodName}`)
        .setColor(0xffd700)
        .addFields(fields)
        .setTimestamp();

      await message.edit({
        embeds: [embed],
      });
    } catch (error) {
      this.logger.error(
        `❌ Error actualizando ranking ${type} ${period}. Mensaje: ${messageId}`,
        error,
      );
    }
  }

  private getPeriodName(
    period: LeaderboardPeriod,
  ): string {
    switch (period) {
      case 'daily':
        return 'Diario';

      case 'weekly':
        return 'Semanal';

      case 'monthly':
        return 'Mensual';
    }
  }
}
