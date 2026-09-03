import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { LeaderboardsReaderService } from '../services/leaderboards-reader.service';

@Injectable()
export class LeaderboardsCommand {
  constructor(private leaderboardsReader: LeaderboardsReaderService) {}

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('leaderboards')
      .setDescription('Ver leaderboards de ajLeaderboards')
      .addStringOption(option =>
        option
          .setName('tipo')
          .setDescription('Tipo de ranking')
          .addChoices(
            { name: 'Player Kills', value: 'kills' },
            { name: 'Tiempo jugado', value: 'time' },
            { name: 'Balance', value: 'money' },
          )
          .setRequired(true),
      )
      .addStringOption(option =>
        option
          .setName('periodo')
          .setDescription('Período de tiempo')
          .addChoices(
            { name: 'Diario', value: 'daily' },
            { name: 'Semanal', value: 'weekly' },
            { name: 'Mensual', value: 'monthly' },
            { name: 'Anual', value: 'yearly' },
          )
          .setRequired(true),
      );
  }

  async execute(interaction: CommandInteraction | ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: false });

    const tipo = (interaction as ChatInputCommandInteraction).options.getString('tipo', true);
    const periodo = (interaction as ChatInputCommandInteraction).options.getString('periodo', true);

    const leaderboard = await this.leaderboardsReader.getLeaderboard(tipo, periodo, 10);

    if (!leaderboard || leaderboard.length === 0) {
      return interaction.editReply({
        content: 'No hay datos disponibles para este período',
      });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const typeNames: Record<string, string> = {
      kills: '⚔️ Player Kills',
      time: '⏱️ Tiempo Jugado',
      money: '💰 Balance',
    };

    const periodNames: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    };

    const fields = leaderboard.map((entry, i) => {
	  const medal = medals[i] || '  ';
	  let value = '';

	  if (tipo === 'time') {
	    const hours = entry.score / 3600;
	    value = `${hours.toFixed(1).replace('.', ',')} horas`;
	  } else if (tipo === 'money') {
	    value = `$${entry.score.toLocaleString()} monedas`;
	  } else if (tipo === 'kills') {
	    value = `${entry.score.toLocaleString()} jugadores asesinados`;
	  } else {
	    value = entry.score.toString();
	  }

	  return {
	    name: `${medal} #${entry.position} ${entry.playerName}`,
	    value: value,
	    inline: true,
	  };
	});

    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${typeNames[tipo]} - ${periodNames[periodo]}`)
      .setColor(0xffd700)
      .addFields(fields)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}
