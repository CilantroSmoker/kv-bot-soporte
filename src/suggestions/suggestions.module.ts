import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suggestion } from './entities/suggestion.entity';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsInteractionHandler } from './suggestions-interaction.handler';
import { DiscordModule } from '../discord.module';

@Module({
  imports: [TypeOrmModule.forFeature([Suggestion]), forwardRef(() => DiscordModule)],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, SuggestionsInteractionHandler],
  exports: [SuggestionsService, SuggestionsInteractionHandler],
})
export class SuggestionsModule {}