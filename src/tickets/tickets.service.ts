import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketType } from './entities/ticket.entity';

function generateTicketId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `TKT-${rand}`;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  async getOpenTicketByUser(userId: string, guildId: string, type: TicketType) {
    return this.ticketRepo.findOne({ where: { user_id: userId, guild_id: guildId, type, status: 'open' } });
  }

  async getTicketById(ticketId: string) {
    return this.ticketRepo.findOne({ where: { ticket_id: ticketId } });
  }

  private async nextTicketNumber(): Promise<number> {
    const count = await this.ticketRepo.count();
    return count + 1;
  }

  async createTicket(data: {
  type: TicketType;
  userId: string;
  guildId: string;
  channelId: string;
  subject: string;
  appealReason?: string | null;
  minecraftUsername?: string;
  platform?: string;
  device?: string;
}): Promise<Ticket> {
  return this.ticketRepo.save({
    ticket_id: generateTicketId(),
    ticket_number: await this.nextTicketNumber(),
    type: data.type,
    user_id: data.userId,
    guild_id: data.guildId,
    channel_id: data.channelId,
    subject: data.subject || 'Sin asunto',
    appeal_reason: data.appealReason || undefined,
    minecraft_username: data.minecraftUsername,
    platform: data.platform,
    device: data.device,
    status: 'open',
  } as Ticket);
}
    
  async updateTicketChannelId(ticketId: string, channelId: string) {
  await this.ticketRepo.update({ ticket_id: ticketId }, { channel_id: channelId });
  }  

  async claimTicket(ticketId: string, staffId: string) {
    await this.ticketRepo.update({ ticket_id: ticketId }, { claimed_by: staffId });
  }

  async closeTicket(ticketId: string, closedBy: string) {
    await this.ticketRepo.update(
      { ticket_id: ticketId },
      { status: 'closed', closed_by: closedBy, closed_at: new Date() },
    );
  }

  async setLogMessageId(ticketId: string, messageId: string) {
    await this.ticketRepo.update({ ticket_id: ticketId }, { log_message_id: messageId });
  }
}