import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clan } from './clan.entity';
import { ClanApplication } from './clan-application.entity';
import { ClanMember } from './clan-member.entity';
import { ClansService } from './clans.service';
import { ClansPanelService } from './clans-panel.service';
import { ClansInteractionHandler } from './clans-interaction.handler';
import { ClanCommand } from './clan.command';
import { ClansPanelCommand } from './clans-panel.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clan,
      ClanApplication,
      ClanMember,
    ]),
  ],
  providers: [
  ClansService,
  ClansPanelService,
  ClansInteractionHandler,
  ClanCommand,
  ClansPanelCommand,
],	
  exports: [
  ClansService,
  ClansPanelService,
  ClansInteractionHandler,
  ClanCommand,
  ClansPanelCommand,
],
})
export class ClansModule {}
