import { Injectable } from '@nestjs/common';
import { TicketEmbeds } from './tickets.embeds';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  AttachmentBuilder,
  MessageFlags,
} from 'discord.js';

@Injectable()
export class SendPanelCommand {
  private readonly notificationsRoleId: string;
  private readonly notificationsMention: string;

  constructor(private readonly configService: ConfigService) {
    this.notificationsRoleId =
      this.configService.get<string>('NOTIFICATIONS_ROLE_ID') ?? '';

    this.notificationsMention = `||<@&${this.notificationsRoleId}>||`;
  }

  async executeSendPanelTickets(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const channel = interaction.channel as TextChannel;
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: 'Este comando solo funciona en canales de texto.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.reply({
      content: '✅ Panel de tickets enviado.',
      flags: [MessageFlags.Ephemeral],
    });

    // 1. ENVIAMOS PRIMERO LA IMAGEN (GIF) DEL BANNER
    await channel.send({
      content: 'https://cdn.discordapp.com/attachments/1536248699707990056/1536270234632331364/embegif.gif?ex=6a7acaa6&is=6a797926&hm=0f828d73ae641e8788703126f6ed173037820cc77a1eb3f34e33d3aebee2d4fc&',
    });

    // 2. CREAMOS LOS BOTONES
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open_soporte')
        .setLabel('🔵 Soporte')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('ticket_open_apelacion')
        .setLabel('🔴 Apelación')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_open_postulacion')
        .setLabel('🟢 Postulación')
        .setStyle(ButtonStyle.Success),
    );

    // 3. ENVIAMOS EL EMBED CON EL TEXTO Y LOS BOTONES PEGADOS ABAJO
    await channel.send({
      embeds: [TicketEmbeds.panel()],
      components: [row],
    });
  }
  async executeSendPanelPostulaciones(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const channel = interaction.channel as TextChannel;
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: 'Este comando solo funciona en canales de texto.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.reply({
      content: '✅ Panel de postulaciones enviado.',
      flags: [MessageFlags.Ephemeral],
    });

    // 1. Enviamos el banner de postulaciones arriba
    const attachment = new AttachmentBuilder('https://cdn.discordapp.com/attachments/1536248699707990056/1536295518915928154/postulaciones.png?ex=6a7ae232&is=6a7990b2&hm=44729a0a62a0d0&', { name: 'postulaciones.png' });
    await channel.send({ files: [attachment] });

    // 2. Creamos el botón individual para postularse
    const rowPostulaciones = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open_postulacion')
        .setLabel('Postularse')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
    );

    // 3. Enviamos el embed de postulaciones y el botón abajo
    await channel.send({
      embeds: [TicketEmbeds.applicationPanel()],
      components: [rowPostulaciones],
    });
  }

  async executeBotOperational(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const channel = interaction.channel as TextChannel;
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: 'Este comando solo funciona en canales de texto.',
        flags: [MessageFlags.Ephemeral],
      });
    }
    await channel.send({ embeds: [TicketEmbeds.botOperational()] });
    return interaction.reply({
      content: '✅ Comunicado enviado.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  async executeReglasDiscord(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const targetChannel = await this.resolveChannel(
      interaction,
      this.configService.get<string>('REGLAS_DISCORD_CHANNEL_ID'),
    );
    if (!targetChannel) {
      return interaction.reply({
        content: 'Canal de reglas de Discord no configurado o no encontrado.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setTitle('📜 Reglas de Discord')
      .setDescription('Aquí van las reglas de la comunidad de Discord.')
      .setThumbnail(interaction.guild?.iconURL() ?? null)
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });
    return interaction.reply({
      content: '✅ Reglas de Discord enviadas.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  async executeReglasServidor(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const targetChannel = await this.resolveChannel(
      interaction,
      this.configService.get<string>('REGLAS_SERVIDOR_CHANNEL_ID'),
    );
    if (!targetChannel) {
      return interaction.reply({
        content: 'Canal de reglas del servidor no configurado o no encontrado.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setTitle('⛏ Reglas del Servidor de Minecraft')
      .setDescription('Aquí van las reglas oficiales de Koshi Village.')
      .setThumbnail(interaction.guild?.iconURL() ?? null)
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });
    return interaction.reply({
      content: '✅ Reglas del servidor enviadas.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  private async resolveChannel(
    interaction: ChatInputCommandInteraction<CacheType>,
    channelId: string | undefined,
  ): Promise<TextChannel | null> {
    if (!channelId || !interaction.guild) return null;
    const channel = await interaction.guild.channels
      .fetch(channelId)
      .catch(() => null);
    return channel instanceof TextChannel ? channel : null;
  }
}
