import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuildMember } from 'discord.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  private getRoleId(): string {
    const roleId = this.configService.get<string>('NOTIFICATIONS_ROLE_ID');

    if (!roleId) {
      throw new Error('NOTIFICATIONS_ROLE_ID no está configurado en el .env');
    }

    return roleId;
  }

  async addNotificationRole(member: GuildMember): Promise<boolean> {
    const roleId = this.getRoleId();

    if (member.roles.cache.has(roleId)) {
      return false;
    }

    await member.roles.add(roleId);

    this.logger.log(
      `Rol de notificaciones agregado a ${member.user.tag} (${member.id})`,
    );

    return true;
  }

  async removeNotificationRole(member: GuildMember): Promise<boolean> {
    const roleId = this.getRoleId();

    if (!member.roles.cache.has(roleId)) {
      return false;
    }

    await member.roles.remove(roleId);

    this.logger.log(
      `Rol de notificaciones eliminado de ${member.user.tag} (${member.id})`,
    );

    return true;
  }
}
