import { DiscordRoleService } from './services/discord-role.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordLevel } from './entities/discord-level.entity';
import { LevelsService } from './services/levels.service';
import { XpCalculatorService } from './services/xp-calculator.service';
import { LevelTitleService } from './services/level-title.service';
import { LevelUpNotificationService } from './services/level-up-notification.service';
import { MessageListener } from './listeners/message.listener';
import { LevelCommand } from './commands/level.command';
import { RankCommand } from './commands/rank.command';

@Module({
  imports: [TypeOrmModule.forFeature([DiscordLevel])],
  providers: [
    DiscordRoleService,
    LevelsService,
    XpCalculatorService,
    LevelTitleService,
    LevelUpNotificationService,
    MessageListener,
    LevelCommand,
    RankCommand,
  ],
  exports: [LevelsService, MessageListener, LevelCommand, RankCommand],
})
export class LevelsModule {}
