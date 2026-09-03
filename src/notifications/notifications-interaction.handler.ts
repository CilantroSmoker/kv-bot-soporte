import { Injectable, Logger } from '@nestjs/common';
import {
  ButtonInteraction,
  GuildMember,
  Interaction,
} from 'discord.js';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsInteractionHandler {
  private readonly logger = new Logger(NotificationsInteractionHandler.name);

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  async handle(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    if (
      interaction.customId !== 'notifications_add' &&
      interaction.customId !== 'notifications_remove'
    ) {
      return;
    }

    if (!interaction.guild || !interaction.member) {
      await interaction.reply({
        content: '❌ Esta acción solo puede utilizarse dentro del servidor.',
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as GuildMember;

    try {
      if (interaction.customId === 'notifications_add') {
        const added = await this.notificationsService.addNotificationRole(
          member,
        );

        await interaction.reply({
          content: added
            ? '🔔 **Notificaciones activadas correctamente.**\nAhora recibirás los avisos del servidor.'
            : 'ℹ️ **Ya tienes activado el rol de notificaciones.**',
          ephemeral: true,
        });

        return;
      }

      if (interaction.customId === 'notifications_remove') {
        const removed = await this.notificationsService.removeNotificationRole(
          member,
        );

        await interaction.reply({
          content: removed
            ? '🔕 **Notificaciones desactivadas correctamente.**\nYa no recibirás los avisos del servidor.'
            : 'ℹ️ **No tienes el rol de notificaciones.**',
          ephemeral: true,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error gestionando el rol de notificaciones para ${interaction.user.tag}`,
        error,
      );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ Ocurrió un error al modificar tu rol de notificaciones.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ Ocurrió un error al modificar tu rol de notificaciones.',
          ephemeral: true,
        });
      }
    }
  }
}
