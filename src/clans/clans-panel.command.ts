import { Injectable, Logger } from '@nestjs/common';
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  ChannelType,
} from 'discord.js';
import { ClansPanelService } from './clans-panel.service';

@Injectable()
export class ClansPanelCommand {
  private readonly logger = new Logger(ClansPanelCommand.name);

  constructor(
    private readonly clansPanelService: ClansPanelService,
  ) {}

  getSlashCommand() {
    return new SlashCommandBuilder()
      .setName('send-panel-clan')
      .setDescription('Publica el panel del sistema de clanes')
      .toJSON();
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    try {
      await interaction.deferReply({
        flags: [MessageFlags.Ephemeral],
      });

      const channel = interaction.channel;

      if (
        !channel ||
        channel.type !== ChannelType.GuildText
      ) {
        await interaction.editReply({
          content:
            '❌ Este comando debe ejecutarse en un canal de texto.',
        });
        return;
      }

      const message = await channel.send({
        embeds: [
          {
            title: '🏯 Sistema de Clanes',
            description:
              '¡Crea tu propio clan o únete a uno existente!\n\n' +
              'Los clanes permiten reunir jugadores, formar equipos ' +
              'y competir juntos dentro de **Koshi Village**.\n\n' +
              'Si quieres crear tu propio clan, pulsa el botón de abajo.',
            fields: [
              {
                name: '🏯 Crear un clan',
                value:
                  'Pulsa **Crear clan** para comenzar el proceso de creación.',
                inline: false,
              },
              {
                name: '⚔️ Unirte a un clan',
                value:
                  'Explora los clanes publicados en el foro y postúlate al que más te interese.',
                inline: false,
              },
            ],
            footer: {
              text: 'Koshi Village • Sistema de Clanes',
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                custom_id: 'clan_create',
                label: 'Crear clan',
                style: 1,
                emoji: {
                  name: '🏯',
                },
              },
            ],
          },
        ],
      });

      await interaction.editReply({
        content:
          `✅ Panel de clanes publicado correctamente.\n` +
          `ID del mensaje: \`${message.id}\``,
      });
    } catch (error) {
      this.logger.error(
        'Error publicando el panel de clanes',
        error,
      );

      if (interaction.deferred) {
        await interaction.editReply({
          content:
            '❌ No se pudo publicar el panel de clanes.',
        });
      }
    }
  }
}
