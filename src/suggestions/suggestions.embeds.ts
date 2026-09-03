import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Suggestion } from './entities/suggestion.entity';
import { SUGGESTION_CATEGORIES } from './dto/create-suggestion.dto';
import { SuggestionStatus } from './suggestion-status.enum';

const COLOR = {
  PANEL: 0xFFD700, // Dorado elegante
  PENDING: 0xf0b232,
  APPROVED: 0x23a55a,
  REJECTED: 0xf23f43,
  IMPLEMENTED: 0x5865f2,
};

const STATUS_LABEL: Record<SuggestionStatus, string> = {
  [SuggestionStatus.PENDING]: '⏳ Pendiente',
  [SuggestionStatus.APPROVED]: '✅ Aprobada',
  [SuggestionStatus.REJECTED]: '❌ Rechazada',
  [SuggestionStatus.IMPLEMENTED]: '🚀 Implementada',
};

const STATUS_COLOR: Record<SuggestionStatus, number> = {
  [SuggestionStatus.PENDING]: COLOR.PENDING,
  [SuggestionStatus.APPROVED]: COLOR.APPROVED,
  [SuggestionStatus.REJECTED]: COLOR.REJECTED,
  [SuggestionStatus.IMPLEMENTED]: COLOR.IMPLEMENTED,
};

function truncate(str: string, max = 1000): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function buildCategoryRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('suggestion_category_select')
    .setPlaceholder('Selecciona una categoría...')
    .addOptions(
      SUGGESTION_CATEGORIES.map((c) =>
        new StringSelectMenuOptionBuilder().setLabel(c).setValue(c),
      ),
    );
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export const SuggestionEmbeds = {
  panel: () =>
    new EmbedBuilder()
      .setColor(COLOR.PANEL)
      .setTitle('🌟  ʙᴜᴢᴏ́ɴ ᴅᴇ sᴜɢᴇʀᴇɴᴄɪᴀs  🌟')
      .setDescription(
        '**¡Tu opinión nos importa! Si tienes ideas para mejorar el servidor, este es el lugar.**\n\u200b\n' +
        '> 📍 Selecciona la categoría en el menú desplegable de abajo para abrir el formulario de tu sugerencia.\n\u200b\n' +
        '-# 💡 Tu sugerencia será revisada por el equipo de administración.',
      )
      .setFooter({ text: 'Koshi Village • Sistema de Sugerencias' })
      .setTimestamp(),
	
  thread: (sug: Suggestion, userTag: string, userAvatar: string) =>
    new EmbedBuilder()
      .setColor(STATUS_COLOR[sug.status] ?? COLOR.PENDING)
      .setAuthor({ name: userTag, iconURL: userAvatar })
      .setTitle(`💡  Sugerencia #${sug.suggestionNumber}`)
      .setDescription(truncate(sug.content))
      .addFields(
        { name: '📂 Categoría', value: sug.category, inline: true },
        { name: '📊 Estado', value: STATUS_LABEL[sug.status] ?? sug.status, inline: true },
      )
      .setFooter({ text: `ID: ${sug.id}` })
      .setTimestamp(),

  reviewed: (sug: Suggestion, userTag: string, userAvatar: string, reviewerTag: string) =>
    new EmbedBuilder()
      .setColor(STATUS_COLOR[sug.status] ?? COLOR.PENDING)
      .setAuthor({ name: userTag, iconURL: userAvatar })
      .setTitle(`💡  Sugerencia #${sug.suggestionNumber} — ${STATUS_LABEL[sug.status] ?? sug.status}`)
      .setDescription(truncate(sug.content))
      .addFields(
        { name: '📂 Categoría', value: sug.category, inline: true },
        { name: '🛠 Revisado por', value: reviewerTag, inline: true },
        ...(sug.reviewNote ? [{ name: '📝 Nota del staff', value: truncate(sug.reviewNote), inline: false }] : []),
      )
      .setFooter({ text: `ID: ${sug.id}` })
      .setTimestamp(),
};
