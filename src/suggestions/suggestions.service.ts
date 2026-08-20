import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suggestion } from './entities/suggestion.entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { SuggestionStatus } from './suggestion-status.enum';

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(
    @InjectRepository(Suggestion)
    private readonly suggestionRepository: Repository<Suggestion>,
  ) {}

  async createSuggestion(dto: CreateSuggestionDto) {
    const last = await this.suggestionRepository.find({
      order: { suggestionNumber: 'DESC' },
      take: 1,
    });
    const nextNumber = last.length ? last[0].suggestionNumber + 1 : 1;
    const suggestion = this.suggestionRepository.create({
      suggestionNumber: nextNumber,
      title: dto.title.trim(),
      content: dto.content.trim(),
      category: dto.category,
      userId: dto.userId,
      status: SuggestionStatus.PENDING,
    });
    return this.suggestionRepository.save(suggestion);
  }

  async getSuggestionById(id: string) {
    return this.suggestionRepository.findOne({ where: { id } });
  }

  async setThreadInfo(id: string, messageId?: string, threadId?: string) {
    await this.suggestionRepository.update({ id }, { messageId, threadId });
  }

  async updateStatus(id: string, status: SuggestionStatus, reviewedBy?: string, reviewNote?: string) {
    const suggestion = await this.getSuggestionById(id);
    if (!suggestion) return null;
    suggestion.status = status;
    if (reviewedBy) suggestion.reviewedBy = reviewedBy;
    if (reviewNote) suggestion.reviewNote = reviewNote;
    return this.suggestionRepository.save(suggestion);
  }
}