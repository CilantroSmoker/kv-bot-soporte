import { GuildMember } from 'discord.js';
import { ConfigService } from '@nestjs/config';

export class TicketsPermissions {
  constructor(private readonly configService: ConfigService) {}

  isStaff(member: GuildMember | null): boolean {
    if (!member) return false;
    if (member.permissions.has('Administrator')) return true;
    const adminRole = this.configService.get<string>('TICKETS_ADMIN_ROLE_ID');
    const staffRole = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    if (adminRole && member.roles.cache.has(adminRole)) return true;
    if (staffRole && member.roles.cache.has(staffRole)) return true;
    return false;
  }

  getViewerRoles(): string[] {
    const raw = this.configService.get<string>('TICKETS_VIEWER_ROLES') || '';
    return raw.split(',').map((r) => r.trim()).filter(Boolean);
  }
}