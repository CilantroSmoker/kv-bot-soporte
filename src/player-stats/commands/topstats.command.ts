import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { PlayerStatsService } from '../services/player-stats.service';

@Injectable()
export class TopstatsCommand {
  constructor(private playerStatsService: PlayerStatsService) {}

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('topstats')
      .setDescription('Ver ranking de jugadores')
      .addStringOption(option =>
        option
          .setName('tipo')
          .setDescription('Tipo de ranking')
          .addChoices(
            { name: '⛏️ Bloques minados', value: 'blocks_mined' },
            { name: '⚔️ Jugadores eliminados', value: 'players_killed' },
            { name: '🐷 Mobs eliminados', value: 'mobs_killed' },
          )
          .setRequired(true),
      );
  }

  async execute(interaction: CommandInteraction | ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: false });

    const tipo = (interaction as ChatInputCommandInteraction).options.getString('tipo', true);

    const top = await this.playerStatsService.getTopPlayers(tipo, 10);

    if (!top || top.length === 0) {
      return interaction.editReply({
        content: '❌ No hay datos disponibles',
      });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const fields = top.map((player, i) => {
      const medal = medals[i] || '  ';
      return {
        name: `${medal} #${player.position} ${player.username}`,
        value: player.value.toString(),
        inline: true,
      };
    });

    const typeNames: Record<string, string> = {
      blocks_mined: '⛏️ Bloques minados',
      players_killed: '⚔️ Jugadores eliminados',
      mobs_killed: '🐷 Mobs eliminados',
    };

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Top 10 - ${typeNames[tipo] || tipo}`)
      .setColor(0xffd700)
      .addFields(fields)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}
