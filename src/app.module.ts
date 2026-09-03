import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { URL } from 'url';
import { DiscordModule } from './discord.module';
import { TicketsModule } from './tickets/tickets.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { SupportModule } from './support/support.module';
import { ServerInfoModule } from './server-info/server-info.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ClansModule } from './clans/clans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        let host = '127.0.0.1';
        let port = 3306;
        let username = 'root';
        let password = '';
        let database = 's1_koshivillage_bot';

        if (databaseUrl) {
          try {
            const url = new URL(databaseUrl);
            host = url.hostname || '127.0.0.1';
            port = parseInt(url.port || '3306');
            username = url.username || 'root';
            password = url.password || '';
            database = url.pathname?.replace('/', '') || 's1_koshivillage_bot';
          } catch (e) {
            console.error('Error parsing DATABASE_URL:', e);
          }
        }

        return {
          type: 'mysql' as any,
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: false,
        };
      },
    }),
    DiscordModule,
    TicketsModule,
    SuggestionsModule,
    SupportModule,
    ServerInfoModule,
    PlayerStatsModule,
    NotificationsModule,
    ClansModule,
  ],
})
export class AppModule {}
