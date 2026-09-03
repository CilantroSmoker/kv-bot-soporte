import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsInteractionHandler } from './tickets-interaction.handler';
import { SendPanelCommand } from './send-panel.command';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [
    TicketsService,
    TicketsInteractionHandler,
    SendPanelCommand,
  ],
  exports: [
    TicketsInteractionHandler,
    TicketsService,
    SendPanelCommand,
  ],
})
export class TicketsModule {}