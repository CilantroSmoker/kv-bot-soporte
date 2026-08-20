import { IsNotEmpty, IsString, MaxLength, IsIn } from 'class-validator';

export const SUGGESTION_CATEGORIES = [
  'Servidor/Gameplay',
  'Bot de Discord',
  'Reglas/Comunidad',
  'Eventos',
  'Otra',
] as const;

export class CreateSuggestionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUGGESTION_CATEGORIES)
  category: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}