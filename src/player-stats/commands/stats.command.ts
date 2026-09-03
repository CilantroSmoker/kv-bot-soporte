import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { PlayerStatsService } from '../services/player-stats.service';

@Injectable()
export class StatsCommand {
  constructor(private playerStatsService: PlayerStatsService) {}

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Ver estadísticas de un jugador')
      .addStringOption(option =>
        option
          .setName('usuario')
          .setDescription('Nombre del jugador Minecraft (opcional)')
          .setRequired(false),
      );
  }

  async execute(interaction: CommandInteraction | ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const username = (interaction as ChatInputCommandInteraction).options.getString('usuario');

    if (!username) {
      return interaction.editReply({
        content: '❌ Debes especificar el nombre del jugador',
      });
    }

    const stats = await this.playerStatsService.getPlayerStats(username);

    if (!stats) {
      return interaction.editReply({
        content: `❌ No se encontraron estadísticas para **${username}**`,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📊 Estadísticas de ${stats.username}`)
      .setColor(0x00ff00)
      .addFields(
        {
          name: '⛏️ Bloques minados',
          value: stats.blocks_mined.toString(),
          inline: true,
        },
        {
          name: '🧱 Bloques colocados',
          value: stats.blocks_placed.toString(),
          inline: true,
        },
        {
          name: '🐷 Mobs eliminados',
          value: stats.mobs_killed.toString(),
          inline: true,
        },
        {
          name: '⚔️ Jugadores eliminados',
          value: stats.players_killed.toString(),
          inline: true,
        },
        {
          name: '💀 Muertes',
          value: stats.deaths.toString(),
          inline: true,
        },
        {
          name: '📈 Nivel',
          value: `${stats.level} (XP: ${stats.xp}/${stats.level * 100})`,
          inline: true,
        },
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}
