import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';

@Injectable()
export class NotificationsPanelService {
  async sendPanel(channel: TextChannel): Promise<string> {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🔔 Notificaciones de Koshi Village')
      .setDescription(
        '¿Quieres recibir las notificaciones importantes del servidor?\n\n' +
        'Al activar las notificaciones recibirás avisos sobre **eventos, anuncios y novedades importantes**.\n\n' +
        'Puedes activar o desactivar este rol cuando quieras.',
      )
      .setFooter({
        text: 'Koshi Village • Sistema de notificaciones',
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('notifications_add')
        .setLabel('Activar notificaciones')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔔'),

      new ButtonBuilder()
        .setCustomId('notifications_remove')
        .setLabel('Desactivar notificaciones')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔕'),
    );

    const message = await channel.send({
      embeds: [embed],
      components: [row],
    });

    return message.id;
  }
}
