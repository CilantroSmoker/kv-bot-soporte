import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuggestionsModule } from '../suggestions/suggestions.module';
import { SupportService } from './support.service';

@Module({
  imports: [ConfigModule, SuggestionsModule],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
