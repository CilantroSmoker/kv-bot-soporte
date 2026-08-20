import { Module, forwardRef } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { TicketsModule } from './tickets/tickets.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { SupportModule } from './support/support.module';
import { ServerInfoModule } from './server-info/server-info.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';
import { DiscordLogsService } from './discord-logs.service';
import { LevelsModule } from './levels/levels.module';
import { StatusUpdaterService } from './server-info/status-updater.service';

@Module({
  imports: [
    LevelsModule,
    forwardRef(() => TicketsModule),
    forwardRef(() => SuggestionsModule),
    SupportModule,
    ServerInfoModule,
    forwardRef(() => PlayerStatsModule),
  ],
  providers: [
    DiscordService,
    DiscordLogsService,
    StatusUpdaterService,
  ],
  exports: [
    DiscordService,
  ],
})
export class DiscordModule {}
