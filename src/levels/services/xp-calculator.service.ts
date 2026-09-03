import { Injectable } from '@nestjs/common';

@Injectable()
export class XpCalculatorService {
  /**
   * XP necesaria para completar UN nivel.
   *
   * Esta función NO representa la XP total acumulada.
   * Representa solamente el coste de ese nivel.
   */
  calculateXpForLevel(level: number): number {
    if (level <= 0) {
      return 0;
    }

    return Math.round(8 * level ** 2 + 80 * level + 150);
  }

  calculateTotalXpForLevel(level: number): number {
    if (level <= 0) {
      return 0;
    }

    let totalXp = 0;

    for (let currentLevel = 1; currentLevel <= level; currentLevel++) {
      totalXp += this.calculateXpForLevel(currentLevel);
    }

    return totalXp;
  }

  calculateXpGain(messageLength: number): number {
  const base = 25;
  const perChar = Math.floor(messageLength / 4);

  return Math.min(base + perChar, 75);
}

  checkLevelUp(
    currentLevel: number,
    totalXp: number,
  ): {
    leveledUp: boolean;
    newLevel: number;
  } {
    let newLevel = Math.max(0, currentLevel);

    while (
      totalXp >= this.calculateTotalXpForLevel(newLevel + 1)
    ) {
      newLevel++;
    }

    return {
      leveledUp: newLevel > currentLevel,
      newLevel,
    };
  }
}
