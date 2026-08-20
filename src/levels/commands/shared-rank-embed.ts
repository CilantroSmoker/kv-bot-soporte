import { APIEmbed } from 'discord.js';
import { DiscordLevel } from '../entities/discord-level.entity';
import { XpCalculatorService } from '../services/xp-calculator.service';

export class SharedRankEmbed {
  constructor(private xpCalc: XpCalculatorService) {}

  buildLevelEmbed(
    user: DiscordLevel | null,
    targetUsername: string,
    xpForCurrentLevel: number,
    xpForNextLevel: number,
  ): APIEmbed {
    if (!user || user.level === 0) {
      return {
        color: 0x808080,
        title: `📊 Nivel de ${targetUsername}`,
        description: 'Este usuario aún no ha ganado experiencia.',
        footer: { text: 'Koshi Village Levels' },
      };
    }

    const totalXp = user.xp;

    // XP obtenida dentro del nivel actual.
    const currentLevelXp = Math.max(
      0,
      totalXp - xpForCurrentLevel,
    );

    // XP que cuesta pasar del nivel actual al siguiente.
    const xpNeededForLevel =
      xpForNextLevel - xpForCurrentLevel;

    const progressPercent =
      xpNeededForLevel > 0
        ? Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (currentLevelXp / xpNeededForLevel) * 100,
              ),
            ),
          )
        : 100;

    const filledBlocks = Math.min(
      20,
      Math.floor(progressPercent / 5),
    );

    const emptyBlocks = Math.max(
      0,
      20 - filledBlocks,
    );

    const progressBar =
      '█'.repeat(filledBlocks) +
      '░'.repeat(emptyBlocks);

    return {
      color: 0x5865f2,
      title: `Nivel de ${targetUsername}`,
      fields: [
        {
          name: 'Nivel Actual',
          value: `\`${user.level}\``,
          inline: true,
        },
        {
          name: 'Mensajes',
          value: `\`${user.messages}\``,
          inline: true,
        },
        {
          name: 'Experiencia',
          value: `\`${currentLevelXp} / ${xpNeededForLevel} XP\``,
          inline: false,
        },
        {
          name: 'Progreso',
          value: `\`${progressBar}\` ${progressPercent}%`,
          inline: false,
        },
      ],
      footer: { text: 'Koshi Village Levels' },
    };
  }

  buildRankEmbed(
  users: DiscordLevel[],
  usernames: Map<string, string>,
): APIEmbed {
  const fields = users
    .slice(0, 10)
    .map((user, index) => {
      const username =
        usernames.get(user.discordId) ?? 'Usuario desconocido';

      return {
        name: `#${index + 1} • Nivel ${user.level}`,
        value: `\`${username}\` • ${user.messages} mensajes`,
        inline: false,
      };
    });

  return {
    color: 0xffd700,
    title: '🏆 Top 10 Ranking',
    fields,
    footer: { text: 'Koshi Village Levels' },
  };
}
}
