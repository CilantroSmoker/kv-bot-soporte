import { Injectable, Logger } from '@nestjs/common';
import { LevelsService } from '../services/levels.service';
import { LevelUpNotificationService } from '../services/level-up-notification.service';
import { Message } from 'discord.js';
import { DiscordRoleService } from '../services/discord-role.service';

@Injectable()
export class MessageListener {
  private readonly logger = new Logger(MessageListener.name);
  private cooldowns = new Map<string, number>();

  constructor(
  private levelsService: LevelsService,
  private levelUpNotification: LevelUpNotificationService,
  private discordRoleService: DiscordRoleService,
) {}

  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot) return;

    if (message.content.startsWith('/') || message.content.startsWith('!')) return;

    const userId = message.author.id;
    const now = Date.now();
    const lastXpTime = this.cooldowns.get(userId) || 0;

    if (now - lastXpTime < 60000) {
      return;
    }

    this.cooldowns.set(userId, now);

    try {
      const result = await this.levelsService.addXp(
        userId,
        message.content.length,
      );

      if (result.leveledUp && result.newLevel !== undefined) {
  this.logger.log(
    `${message.author.username} subió al nivel ${result.newLevel}`,
  );

  await this.levelUpNotification.notifyLevelUp(
    message.client,
    userId,
    message.author.username,
    result.newLevel,
  );

  if (message.guild) {
    const member = await message.guild.members.fetch(userId);

    await this.discordRoleService.syncRole(
      message.guild,
      member,
      result.newLevel,
    );
  }
}
      
    } catch (error) {
      this.logger.error(`Error agregando XP: ${error.message}`);
    }
  }
}
