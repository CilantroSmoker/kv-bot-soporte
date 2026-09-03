import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord.module';

import { Player } from './entities/player.entity';
import { PlayerStats } from './entities/player-stats.entity';
import { PlayerLevel } from './entities/player-level.entity';

import { PlayerStatsService } from './services/player-stats.service';
import { LeaderboardsReaderService } from './services/leaderboards-reader.service';
import { LeaderboardUpdaterService } from './services/leaderboard-updater.service';

import { StatsCommand } from './commands/stats.command';
import { TopstatsCommand } from './commands/topstats.command';
import { LeaderboardsCommand } from './commands/leaderboards.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, PlayerStats, PlayerLevel]),
    forwardRef(() => DiscordModule),
  ],
  providers: [
    PlayerStatsService,
    LeaderboardsReaderService,
    LeaderboardUpdaterService,
    StatsCommand,
    TopstatsCommand,
    LeaderboardsCommand,
  ],
  exports: [
  PlayerStatsService,
  LeaderboardsReaderService,
  LeaderboardUpdaterService,
  StatsCommand,
  TopstatsCommand,
  LeaderboardsCommand,
],
})
export class PlayerStatsModule {}
