import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} from 'discord.js';
import { SuggestionsService } from './suggestions.service';
import { SuggestionEmbeds } from './suggestions.embeds';
import { SuggestionStatus } from './suggestion-status.enum';
import { DiscordService, STATUS_TAG } from '../discord.service';
import { TicketsPermissions } from '../tickets/tickets-permissions';

@Injectable()
export class SuggestionsInteractionHandler {
  private readonly logger = new Logger(SuggestionsInteractionHandler.name);
  private readonly permissions: TicketsPermissions;

  constructor(
    private readonly suggestionsService: SuggestionsService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    private readonly configService: ConfigService,
  ) {
    this.permissions = new TicketsPermissions(configService);
  }

  async handle(interaction: Interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'suggestion_category_select') {
      return this.handleCategorySelect(interaction);
    }
    if (interaction.isModalSubmit() && interaction.customId.startsWith('suggestion_modal_')) {
      return this.handleModal(interaction);
    }
    if (interaction.isButton() && interaction.customId.startsWith('sug_')) {
      return this.handleReviewButton(interaction);
    }
  }

  private async handleCategorySelect(interaction: any) {
    const category = interaction.values[0];
    const modal = new ModalBuilder()
      .setCustomId(`suggestion_modal_${category}`)
      .setTitle('💡 Nueva Sugerencia');

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Título')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(100)
          .setRequired(true),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Descripción')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1000)
          .setRequired(true),
      ),
    );

    return interaction.showModal(modal);
  }

  private async handleModal(interaction: any) {
    const category = interaction.customId.replace('suggestion_modal_', '');
    const title = interaction.fields.getTextInputValue('title');
    const description = interaction.fields.getTextInputValue('description');

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const suggestion = await this.suggestionsService.createSuggestion({
      title,
      content: description,
      category,
      userId: interaction.user.id,
    } as any);

    const forumId = this.configService.get<string>('SUGGESTIONS_FORUM_CHANNEL_ID');
    if (!forumId) {
      return interaction.editReply({ content: 'El foro de sugerencias no está configurado.' });
    }

    const forum = await interaction.guild.channels.fetch(forumId).catch(() => null);
    if (!forum) {
      return interaction.editReply({ content: 'No se pudo encontrar el foro de sugerencias.' });
    }

    const embed = SuggestionEmbeds.thread(suggestion, interaction.user.tag, interaction.user.displayAvatarURL());
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`sug_approve_${suggestion.id}`).setLabel('Aprobar').setStyle(ButtonStyle.Success).setEmoji('✅'),
      new ButtonBuilder().setCustomId(`sug_reject_${suggestion.id}`).setLabel('Rechazar').setStyle(ButtonStyle.Danger).setEmoji('❌'),
      new ButtonBuilder().setCustomId(`sug_implement_${suggestion.id}`).setLabel('Implementar').setStyle(ButtonStyle.Primary).setEmoji('🚀'),
    );

    const { messageId, thread } = await this.discordService.postSuggestion(
      forum as any,
      { suggestion_number: suggestion.suggestionNumber, content: title },
      { embeds: [embed], components: [row] },
    );

    await this.suggestionsService.setThreadInfo(suggestion.id, messageId, thread?.id);

    await interaction.editReply({ content: `Tu sugerencia fue enviada correctamente: #${suggestion.suggestionNumber}` });
  }

  private async handleReviewButton(interaction: any) {
    const { customId, member, guild } = interaction;
    let action: SuggestionStatus | null = null;
    let suggestionId = '';

    if (customId.startsWith('sug_approve_')) { action = SuggestionStatus.APPROVED; suggestionId = customId.replace('sug_approve_', ''); }
    else if (customId.startsWith('sug_reject_')) { action = SuggestionStatus.REJECTED; suggestionId = customId.replace('sug_reject_', ''); }
    else if (customId.startsWith('sug_implement_')) { action = SuggestionStatus.IMPLEMENTED; suggestionId = customId.replace('sug_implement_', ''); }
    if (!action) return;

    if (!this.permissions.isStaff(member)) {
      return interaction.reply({ content: 'Solo el staff puede revisar sugerencias.', flags: [MessageFlags.Ephemeral] });
    }

    const suggestion = await this.suggestionsService.getSuggestionById(suggestionId);
    if (!suggestion) {
      return interaction.reply({ content: 'Sugerencia no encontrada.', flags: [MessageFlags.Ephemeral] });
    }
    if (suggestion.status !== SuggestionStatus.PENDING) {
      return interaction.reply({ content: `Esta sugerencia ya fue revisada (estado: ${suggestion.status}).`, flags: [MessageFlags.Ephemeral] });
    }

    await interaction.deferUpdate();

    const updated = await this.suggestionsService.updateStatus(suggestionId, action, member.id);
    if (!updated) return;

    const forumId = this.configService.get<string>('SUGGESTIONS_FORUM_CHANNEL_ID');
    const forum = forumId ? await guild.channels.fetch(forumId).catch(() => null) : null;

    if (forum && updated.messageId) {
      await this.discordService.applyStatusTag(guild, forum as any, updated.messageId, action as any);
    }

    const author = await interaction.client.users.fetch(updated.userId).catch(() => null);
    if (author) {
      const embed = SuggestionEmbeds.reviewed(updated, author.tag, author.displayAvatarURL(), member.user.tag);
      await interaction.message.edit({ embeds: [embed], components: [] }).catch(() => {});

      let content: string;
      if (action === SuggestionStatus.APPROVED) {
        content = ` ¡Buenas noticias! Tu sugerencia #${updated.suggestionNumber} fue **aprobada**. Pronto la vamos a tener en cuenta.`;
      } else if (action === SuggestionStatus.REJECTED) {
        content = ` Tu sugerencia #${updated.suggestionNumber} fue **rechazada**. ¡Agradecemos tu tiempo!`;
      } else if (action === SuggestionStatus.IMPLEMENTED) {
        content = ` Tu sugerencia #${updated.suggestionNumber} ya fue **implementada**. ¡Gracias por ayudarnos a mejorar!`;
      } else {
        const statusLabel = STATUS_TAG[action as keyof typeof STATUS_TAG] ?? action;
        content = `Tu sugerencia #${updated.suggestionNumber} fue revisada y marcada como: ${statusLabel}.`;
      }

      author.send({ content }).catch(() => {});
    }
  }
}