import { Injectable, Logger } from '@nestjs/common';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordLevel } from '../entities/discord-level.entity';
import { XpCalculatorService } from '../services/xp-calculator.service';
import { SharedRankEmbed } from './shared-rank-embed';

@Injectable()
export class RankCommand {
  private readonly logger = new Logger(RankCommand.name);

  constructor(
    @InjectRepository(DiscordLevel)
    private levelsRepo: Repository<DiscordLevel>,
    private xpCalc: XpCalculatorService,
  ) {}

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('rank')
      .setDescription('Ver el ranking top 10 de la comunidad')
      .toJSON();
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const topUsers = await this.levelsRepo.find({
        order: { level: 'DESC', xp: 'DESC' },
        take: 10,
      });

      const guild = interaction.guild;

      const usernames = new Map<string, string>();

      if (guild) {
        for (const user of topUsers) {
          try {
            const member = await guild.members.fetch(user.discordId);

            usernames.set(
              user.discordId,
              member.user.username,
            );
          } catch {
            usernames.set(
              user.discordId,
              'Usuario desconocido',
            );
          }
        }
      }

      const embed = new SharedRankEmbed(this.xpCalc).buildRankEmbed(
        topUsers,
        usernames,
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Error ejecutando /rank', error);

      await interaction.editReply({
        content: '❌ Hubo un error al obtener el ranking.',
      });
    }
  }
}
