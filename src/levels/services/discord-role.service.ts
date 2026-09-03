import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Guild, GuildMember } from 'discord.js';
import { LevelTitleService } from './level-title.service';

@Injectable()
export class DiscordRoleService {
  private readonly logger = new Logger(DiscordRoleService.name);

  constructor(
    private configService: ConfigService,
    private levelTitle: LevelTitleService,
  ) {}

  async syncRole(
    guild: Guild,
    member: GuildMember,
    level: number,
  ): Promise<void> {
    try {
      const titleInfo = this.levelTitle.getTitleByLevel(level);

      const roleIds = {
        Aprendiz: this.configService.get<string>('LEVEL_ROLE_APRENDIZ'),
        Guerrero: this.configService.get<string>('LEVEL_ROLE_GUERRERO'),
        Samurai: this.configService.get<string>('LEVEL_ROLE_SAMURAI'),
        Maestro: this.configService.get<string>('LEVEL_ROLE_MAESTRO'),
      };

      const newRoleId = roleIds[titleInfo.title as keyof typeof roleIds];

      if (!newRoleId) {
        this.logger.warn(
          `No hay un rol configurado para el rango "${titleInfo.title}".`,
        );
        return;
      }

      const rankRoleIds = Object.values(roleIds).filter(
        (id): id is string => Boolean(id),
      );

      const rolesToRemove = member.roles.cache.filter(
        role => rankRoleIds.includes(role.id) && role.id !== newRoleId,
      );

      if (rolesToRemove.size > 0) {
        await member.roles.remove(
          rolesToRemove,
          `Cambio de rango por nivel ${level}`,
        );
      }

      if (!member.roles.cache.has(newRoleId)) {
        await member.roles.add(
          newRoleId,
          `Rango alcanzado: ${titleInfo.title} (nivel ${level})`,
        );
      }

      this.logger.log(
        `${member.user.username} ahora tiene el rango ${titleInfo.title} (nivel ${level})`,
      );
    } catch (error) {
      this.logger.error(
        `Error sincronizando rol para ${member.user.username}`,
        error,
      );
    }
  }
}
