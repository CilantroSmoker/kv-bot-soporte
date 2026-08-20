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
    if (level >= 31) {
      return { level, title: 'Samurai', emoji: '⛩️' };
    }
    if (level >= 11) {
      return { level, title: 'Guerrero', emoji: '⚔️' };
    }
    return { level, title: 'Aprendiz', emoji: '🗡️' };
  }
}
