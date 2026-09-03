import { Injectable, Logger } from '@nestjs/common';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import { ClansService } from './clans.service';

@Injectable()
export class ClanCommand {
  private readonly logger = new Logger(ClanCommand.name);

  constructor(
    private readonly clansService: ClansService,
  ) {}

  getSlashCommand() {
  return new SlashCommandBuilder()
    .setName('clan')
    .setDescription('Gestionar tu clan')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('info')
        .setDescription('Ver la información de tu clan'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('expulsar')
        .setDescription('Expulsa a un miembro de tu clan')
        .addUserOption((option) =>
          option
            .setName('usuario')
            .setDescription('Usuario que quieres expulsar')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('salir')
        .setDescription('Salir de tu clan'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('disolver')
        .setDescription('Disolver definitivamente tu clan'),
    );
}

 async execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  try {
    const subcommand = interaction.options.getSubcommand();

    /*
     * ============================================================
     * SUBCOMANDO: /clan expulsar
     * ============================================================
     */

    if (subcommand === 'expulsar') {
      const targetUser = interaction.options.getUser(
        'usuario',
        true,
      );

      await interaction.deferReply({
        ephemeral: true,
      });

      try {
        const clan = await this.clansService.removeMember(
          interaction.user.id,
          targetUser.id,
        );

        try {
          await targetUser.send(
            `⚔ **Has sido expulsado de un clan**\n\n` +
              `Has sido expulsado del clan **${clan.name}** por su líder.\n\n` +
              `Actualmente ya no perteneces a ningún clan y puedes volver a postularte a otro.`,
          );
        } catch (error) {
          this.logger.warn(
            `No se pudo enviar DM al usuario expulsado ${targetUser.id}.`,
          );
        }

        await interaction.editReply({
          content:
            `✅ **Usuario expulsado correctamente.**\n\n` +
            `👤 Usuario: <@${targetUser.id}>\n` +
            `🏯 Clan: **${clan.name}**\n` +
            `👥 Miembros: **${clan.memberCount}/${clan.maxMembers}**`,
        });
      } catch (error) {
        this.logger.error(
          `Error expulsando a ${targetUser.id}`,
          error,
        );

        await interaction.editReply({
          content:
            `❌ ${
              error instanceof Error
                ? error.message
                : 'No se pudo expulsar al usuario.'
            }`,
        });
      }

      return;
    }
    
    /*
 * ============================================================
 * SUBCOMANDO: /clan salir
 * ============================================================
 */

if (subcommand === 'salir') {
  await interaction.deferReply({
    ephemeral: true,
  });

  try {
    const clan = await this.clansService.leaveClan(
      interaction.user.id,
    );

    try {
      await interaction.user.send(
        `🚪 **Has salido de un clan**\n\n` +
          `Has salido correctamente del clan **${clan.name}**.\n\n` +
          `Actualmente ya no perteneces a ningún clan y puedes volver a postularte a otro.`,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo enviar DM al usuario ${interaction.user.id}.`,
      );
    }

    await interaction.editReply({
      content:
        `✅ **Has salido correctamente del clan.**\n\n` +
        `🏯 Clan: **${clan.name}**\n` +
        `👥 Miembros restantes: **${clan.memberCount}/${clan.maxMembers}**`,
    });
  } catch (error) {
    this.logger.error(
      `Error haciendo salir del clan a ${interaction.user.id}`,
      error,
    );

    await interaction.editReply({
      content:
        `❌ ${
          error instanceof Error
            ? error.message
            : 'No se pudo salir del clan.'
        }`,
    });
  }

  return;
}

/*
 * ============================================================
 * SUBCOMANDO: /clan disolver
 * ============================================================
 */

if (subcommand === 'disolver') {
  await interaction.deferReply({
    ephemeral: true,
  });

  try {
    const clan = await this.clansService.getClanByMember(
      interaction.user.id,
    );

    if (!clan) {
      await interaction.editReply({
        content: '❌ No perteneces a ningún clan.',
      });
      return;
    }

    if (clan.leaderDiscordId !== interaction.user.id) {
      await interaction.editReply({
        content:
          '❌ **Solo el líder puede disolver el clan.**',
      });
      return;
    }

    const row =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(
            `clan_disband_confirm_${clan.id}`,
          )
          .setLabel('Confirmar disolución')
          .setEmoji('⚠️')
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId(
            `clan_disband_cancel_${clan.id}`,
          )
          .setLabel('Cancelar')
          .setEmoji('❌')
          .setStyle(ButtonStyle.Secondary),
      );

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Disolver clan')
      .setDescription(
        `Estás a punto de disolver definitivamente el clan **${clan.name}**.\n\n` +
        `👥 Miembros actuales: **${clan.memberCount}/${clan.maxMembers}**\n\n` +
        `Esta acción eliminará el clan, sus miembros y sus postulaciones.\n\n` +
        `**Esta acción no se puede deshacer.**`,
      )
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  } catch (error) {
    this.logger.error(
      'Error preparando disolución del clan',
      error,
    );

    await interaction.editReply({
      content:
        '❌ No se pudo preparar la disolución del clan.',
      embeds: [],
      components: [],
    });
  }

  return;
}

    /*
     * ============================================================
     * SUBCOMANDO: /clan info
     * ============================================================
     */

    if (subcommand === 'info') {
      await interaction.deferReply();

      const clan = await this.clansService.getClanByMember(
        interaction.user.id,
      );

      if (!clan) {
        const embed = new EmbedBuilder()
          .setTitle('🏯 Sistema de Clanes')
          .setDescription(
            'Actualmente **no perteneces a ningún clan**.\n\n' +
              'Puedes crear tu propio clan o explorar los clanes disponibles.',
          )
          .addFields({
            name: '📋 Estado',
            value: '❌ Sin clan',
            inline: true,
          })
          .setTimestamp();

        const buttons =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('clan_create')
              .setLabel('Crear clan')
              .setEmoji('🏯')
              .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
              .setCustomId('clan_explore')
              .setLabel('Explorar clanes')
              .setEmoji('⚔')
              .setStyle(ButtonStyle.Primary),
          );

        await interaction.editReply({
          embeds: [embed],
          components: [buttons],
        });

        return;
      }

      const member = await this.clansService.getClanMember(
        interaction.user.id,
      );

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
          {
            name: '🎖 Tu rango',
            value:
              member?.role === 'leader'
                ? '👑 Líder'
                : '⚔ Miembro',
            inline: true,
          },
        );

      if (clan.requirements) {
        embed.addFields({
          name: '📋 Requisitos',
          value: clan.requirements,
          inline: false,
        });
      }

      if (member) {
        embed.addFields({
          name: '🎮 Minecraft',
          value: member.minecraftUsername,
          inline: true,
        });
      }

      const components: ActionRowBuilder<ButtonBuilder>[] = [];

      if (clan.forumThreadId && interaction.guildId) {
        const forumButton = new ButtonBuilder()
          .setLabel('Ver clan')
          .setEmoji('🏯')
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.com/channels/${interaction.guildId}/${clan.forumThreadId}`,
          );

        components.push(
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            forumButton,
          ),
        );
      }

      embed.setTimestamp(clan.createdAt);

      await interaction.editReply({
        embeds: [embed],
        components,
      });

      return;
    }
  } catch (error) {
    this.logger.error(
      `Error ejecutando /clan para ${interaction.user.id}`,
      error,
    );

    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content:
          '❌ Ocurrió un error al procesar la acción.',
        ephemeral: true,
      });
    } else if (interaction.deferred) {
      await interaction.editReply({
        content:
          '❌ Ocurrió un error al procesar la acción.',
        embeds: [],
        components: [],
      });
    }
  }

  }
}
