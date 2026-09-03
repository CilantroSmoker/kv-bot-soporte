import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ForumChannel,
  TextChannel,
} from 'discord.js';
import { Clan } from './clan.entity';

@Injectable()
export class ClansPanelService {
  private readonly logger = new Logger(ClansPanelService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  private getForumChannelId(): string {
    const channelId = this.configService.get<string>(
      'CLANS_FORUM_CHANNEL_ID',
    );

    if (!channelId) {
      throw new Error(
        'CLANS_FORUM_CHANNEL_ID no está configurado en el .env',
      );
    }

    return channelId;
  }

  async createClanForumPost(
    clan: Clan,
    forumChannel: ForumChannel,
  ): Promise<string> {
    const embed = this.buildClanEmbed(clan);

    const button = new ButtonBuilder()
      .setCustomId(`clan_apply_${clan.id}`)
      .setLabel('Postular al clan')
      .setEmoji('📨')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      button,
    );

    const thread = await forumChannel.threads.create({
      name: `🏯 ${clan.name}`,
      message: {
        embeds: [embed],
        components: [row],
      },
    });

    this.logger.log(
      `Publicación del clan "${clan.name}" creada: ${thread.id}`,
    );

    return thread.id;
  }

  buildClanEmbed(clan: Clan): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`🏯 ${clan.name}`)
      .setDescription(clan.description)
      .addFields(
        {
          name: '👑 Líder',
          value: `<@${clan.leaderDiscordId}>`,
          inline: true,
        },
        {
          name: '👥 Miembros',
          value: `${clan.memberCount}/${clan.maxMembers}`,
          inline: true,
        },
      )
      .setTimestamp(clan.createdAt);

    if (clan.requirements) {
      embed.addFields({
        name: '📋 Requisitos',
        value: clan.requirements,
        inline: false,
      });
    }

    embed.addFields({
      name: '📨 ¿Quieres formar parte?',
      value:
        'Pulsa el botón **Postular al clan** para enviar tu solicitud al líder.',
      inline: false,
    });

    return embed;
  }

  async updateClanForumPost(
    clan: Clan,
    thread: any,
  ): Promise<void> {
    const embed = this.buildClanEmbed(clan);

    const button = new ButtonBuilder()
      .setCustomId(`clan_apply_${clan.id}`)
      .setLabel('Postular al clan')
      .setEmoji('📨')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      button,
    );

    const starterMessage = await thread.fetchStarterMessage();

    if (!starterMessage) {
      throw new Error(
        `No se pudo obtener el mensaje inicial del clan ${clan.id}.`,
      );
    }

    await starterMessage.edit({
      embeds: [embed],
      components: [row],
    });
  }

  async getForumChannel(client: any): Promise<ForumChannel> {
    const channelId = this.getForumChannelId();

    const channel = await client.channels.fetch(channelId);

    if (!channel) {
      throw new Error(
        `No se encontró el canal de Foro ${channelId}.`,
      );
    }

    if (channel.type !== ChannelType.GuildForum) {
      throw new Error(
        `El canal ${channelId} no es un canal Foro.`,
      );
    }

    return channel as ForumChannel;
  }
}
