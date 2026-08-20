import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordLevel } from '../entities/discord-level.entity';
import { XpCalculatorService } from './xp-calculator.service';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(DiscordLevel)
    private levelsRepo: Repository<DiscordLevel>,
    private xpCalc: XpCalculatorService,
  ) {}

  async addXp(
    discordId: string,
    messageLength: number,
  ): Promise<{
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
  }> {
    // Mensajes demasiado cortos no entregan XP.
    if (messageLength < 5) {
      return {
        xpGained: 0,
        leveledUp: false,
      };
    }

    // Buscar usuario existente.
    let user = await this.levelsRepo.findOne({
      where: { discordId },
    });

    // Crear usuario si todavía no existe.
    if (!user) {
      user = this.levelsRepo.create({
        discordId,
        xp: 0,
        level: 0,
        messages: 0,
      });
    }

    const xpGain = Math.min(
  this.xpCalc.calculateXpGain(messageLength),
  50,
);

console.log(
  `🔥 XP DEBUG | user=${discordId} | length=${messageLength} | before=${user.xp} | gain=${xpGain}`,
);

const currentXp = Number(user.xp);
const newXp = currentXp + xpGain;

const levelCheck = this.xpCalc.checkLevelUp(
  user.level,
  newXp,
);

user.xp = newXp;
user.level = levelCheck.newLevel;
user.messages++;
user.lastXpAt = Date.now();

await this.levelsRepo.save(user);


    return {
      xpGained: xpGain,
      leveledUp: levelCheck.leveledUp,
      newLevel: levelCheck.leveledUp
        ? levelCheck.newLevel
        : undefined,
    };
  }

  async getUser(discordId: string): Promise<DiscordLevel | null> {
    return this.levelsRepo.findOne({
      where: { discordId },
    });
  }
}
