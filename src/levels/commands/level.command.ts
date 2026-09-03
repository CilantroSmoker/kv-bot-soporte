import { Injectable, Logger } from '@nestjs/common';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { LevelsService } from '../services/levels.service';
import { XpCalculatorService } from '../services/xp-calculator.service';
import { SharedRankEmbed } from './shared-rank-embed';

@Injectable()
export class LevelCommand {
  private readonly logger = new Logger(LevelCommand.name);

  constructor(
    private levelsService: LevelsService,
    private xpCalc: XpCalculatorService,
  ) {}

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('level')
      .setDescription('Ver el nivel tuyo o de otro usuario')
      .addUserOption((option) =>
        option
          .setName('usuario')
          .setDescription('Usuario del cual ver el nivel')
          .setRequired(false),
      )
      .toJSON();
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUser =
        interaction.options.getUser('usuario') || interaction.user;

      const levelData = await this.levelsService.getUser(targetUser.id);

      const currentLevel = levelData?.level ?? 0;

      const xpForCurrentLevel =
        this.xpCalc.calculateTotalXpForLevel(currentLevel);

      const xpForNextLevel =
        this.xpCalc.calculateTotalXpForLevel(currentLevel + 1);

      const embed = new SharedRankEmbed(this.xpCalc).buildLevelEmbed(
        levelData ?? null,
        targetUser.username,
        xpForCurrentLevel,
        xpForNextLevel,
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Error ejecutando /level', error);

      await interaction.editReply({
        content: '❌ Hubo un error al obtener la información de nivel.',
      });
    }
  }
}
