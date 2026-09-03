import { Injectable } from '@nestjs/common';

export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
}

@Injectable()
export class LevelTitleService {
  getTitleByLevel(level: number): LevelInfo {
    if (level >= 60) {
      return { level, title: 'Maestro', emoji: '🏯' };
    }

    if (level >= 45) {
      return { level, title: 'Ronin', emoji: '🐉' };
    }

    if (level >= 30) {
      return { level, title: 'Samurai', emoji: '⛩' };
    }

    if (level >= 25) {
      return { level, title: 'Veterano', emoji: '🛡' };
    }

    if (level >= 15) {
      return { level, title: 'Guerrero', emoji: '⚔' };
    }

    if (level >= 10) {
      return { level, title: 'Aprendiz', emoji: '🗡' };
    }

    if (level >= 5) {
      return { level, title: 'Shinobi', emoji: '🥷' };
    }

    return { level, title: 'Novato', emoji: '🌱' };
  }
  getNextTitleByLevel(level: number): string {
  const currentTitle = this.getTitleByLevel(level).title;

  switch (currentTitle) {
    case 'Novato':
      return 'Shinobi';

    case 'Shinobi':
      return 'Aprendiz';

    case 'Aprendiz':
      return 'Guerrero';

    case 'Guerrero':
      return 'Veterano';

    case 'Veterano':
      return 'Samurai';

    case 'Samurai':
      return 'Ronin';

    case 'Ronin':
      return 'Maestro';

    case 'Maestro':
      return 'Maestro';

    default:
      return 'Maestro';
  }
}

isRankUpLevel(level: number): boolean {
 return [5, 10, 15, 25, 30, 45, 60].includes(level);
}

getRankUpTitle(level: number): LevelInfo | null {
  if (!this.isRankUpLevel(level)) {
    return null;
  }
  return this.getTitleByLevel(level);
}
}
