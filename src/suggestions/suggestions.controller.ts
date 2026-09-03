import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, ParseEnumPipe } from '@nestjs/common';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { SuggestionsService } from './suggestions.service';
import { SuggestionStatus } from './suggestion-status.enum';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  create(@Body() createSuggestionDto: CreateSuggestionDto) {
    return this.suggestionsService.createSuggestion(createSuggestionDto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.suggestionsService.getSuggestionById(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status', new ParseEnumPipe(SuggestionStatus)) status: SuggestionStatus,
  ) {
    return this.suggestionsService.updateStatus(id, status);
  }
}
