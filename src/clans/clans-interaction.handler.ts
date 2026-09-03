import { Injectable, Logger } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { ClansService } from './clans.service';
import { ClansPanelService } from './clans-panel.service';

@Injectable()
export class ClansInteractionHandler {
  private readonly logger = new Logger(ClansInteractionHandler.name);

constructor(
  private readonly clansService: ClansService,
  private readonly clansPanelService: ClansPanelService,
) {}

  async handle(interaction: Interaction): Promise<void> {
    try {
      /*
       * ============================================================
       * BOTÓN: POSTULAR AL CLAN
       * ============================================================
       */

      if (
        interaction.isButton() &&
        interaction.customId.startsWith('clan_apply_')
      ) {
        const clanId = Number(
          interaction.customId.replace('clan_apply_', ''),
        );

        if (!Number.isInteger(clanId)) {
          await interaction.reply({
            content: '❌ El clan indicado no es válido.',
            ephemeral: true,
          });
          return;
        }

        const clan = await this.clansService.getClanById(clanId);

        const check = await this.clansService.canApply(
          clan.id,
          interaction.user.id,
        );

        if (!check.allowed) {
          await interaction.reply({
            content: `❌ ${check.reason}`,
            ephemeral: true,
          });
          return;
        }

        const modal = new ModalBuilder()
          .setCustomId(`clan_application_modal_${clan.id}`)
          .setTitle(`Postular a ${clan.name}`);

        const minecraftInput = new TextInputBuilder()
          .setCustomId('minecraft_username')
          .setLabel('Nombre de Minecraft')
          .setPlaceholder('Ej: Steve123')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100);

        const reasonInput = new TextInputBuilder()
          .setCustomId('reason')
          .setLabel('¿Por qué quieres entrar al clan?')
          .setPlaceholder(
            'Cuéntanos un poco sobre ti y por qué quieres formar parte...',
          )
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1000);

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            minecraftInput,
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            reasonInput,
          ),
        );

        await interaction.showModal(modal);
        return;
      }
	
/*
 * ============================================================
 * BOTÓN: CREAR CLAN
 * ============================================================
 */

if (
  interaction.isButton() &&
  interaction.customId === 'clan_create'
) {
  const existingClan =
    await this.clansService.getClanByMember(
      interaction.user.id,
    );

  if (existingClan) {
    await interaction.reply({
      content:
        `❌ Ya perteneces al clan **${existingClan.name}**.\n` +
        `No puedes crear otro clan mientras pertenezcas a uno.`,
      ephemeral: true,
    });

    return;
  }

  const modal = new ModalBuilder()
    .setCustomId('clan_create_modal')
    .setTitle('Crear un clan');

  const nameInput = new TextInputBuilder()
    .setCustomId('clan_name')
    .setLabel('Nombre del clan')
    .setPlaceholder('Ej: Konoha')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(100);

  const minecraftInput = new TextInputBuilder()
    .setCustomId('minecraft_username')
    .setLabel('Nombre de Minecraft')
    .setPlaceholder('Ej: Steve123')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Descripción del clan')
    .setPlaceholder(
      'Describe tu clan y qué lo hace especial...',
    )
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const requirementsInput = new TextInputBuilder()
    .setCustomId('requirements')
    .setLabel('Requisitos')
    .setPlaceholder(
      'Ej: Ser activo, nivel 20+, Discord obligatorio...',
    )
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      nameInput,
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      minecraftInput,
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      descriptionInput,
    ),
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      requirementsInput,
    ),
  );

  await interaction.showModal(modal);
  return;
}

/*
 * ============================================================
 * BOTONES: DISOLVER CLAN
 * ============================================================
 */

if (
  interaction.isButton() &&
  (
    interaction.customId.startsWith(
      'clan_disband_confirm_',
    ) ||
    interaction.customId.startsWith(
      'clan_disband_cancel_',
    )
  )
) {
  const isConfirm =
    interaction.customId.startsWith(
      'clan_disband_confirm_',
    );

  const prefix = isConfirm
    ? 'clan_disband_confirm_'
    : 'clan_disband_cancel_';

  const clanId = Number(
    interaction.customId.replace(prefix, ''),
  );

  if (!Number.isInteger(clanId)) {
    await interaction.reply({
      content:
        '❌ El clan indicado no es válido.',
      ephemeral: true,
    });

    return;
  }

  /*
   * CANCELAR
   */

  if (!isConfirm) {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌ Disolución cancelada')
          .setDescription(
            'El clan **no ha sido disuelto**.\n\n' +
            'No se realizó ningún cambio.',
          )
          .setTimestamp(),
      ],
      components: [],
    });

    return;
  }

  /*
   * CONFIRMAR
   */

  try {
    const clan =
      await this.clansService.getClanById(
        clanId,
      );

    /*
     * Solo el líder puede confirmar.
     */

    if (
      clan.leaderDiscordId !==
      interaction.user.id
    ) {
      await interaction.reply({
        content:
          '❌ **Solo el líder del clan puede confirmar su disolución.**',
        ephemeral: true,
      });

      return;
    }

    await this.clansService.disbandClan(
      interaction.user.id,
    );

    /*
     * Actualizar el mensaje original.
     */

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('🏯 Clan disuelto')
          .setDescription(
            `El clan **${clan.name}** ha sido disuelto correctamente.`,
          )
          .addFields({
            name: '👥 Miembros liberados',
            value: `${clan.memberCount}`,
            inline: true,
          })
          .setTimestamp(),
      ],
      components: [],
    });

    /*
     * DM AL LÍDER
     *
     * Opcional, pero útil como confirmación.
     */

    try {
      await interaction.user.send(
        `🏯 **Clan disuelto correctamente**\n\n` +
        `El clan **${clan.name}** ha sido eliminado definitivamente.`,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo enviar DM al líder ${interaction.user.id}.`,
      );
    }

    return;
  } catch (error) {
    this.logger.error(
      'Error disolviendo clan',
      error,
    );

    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content:
          `❌ ${
            error instanceof Error
              ? error.message
              : 'No se pudo disolver el clan.'
          }`,
        ephemeral: true,
      });
    } else if (
      interaction.isRepliable()
    ) {
      await interaction.followUp({
        content:
          `❌ ${
            error instanceof Error
              ? error.message
              : 'No se pudo disolver el clan.'
          }`,
        ephemeral: true,
      });
    }

    return;
  }
}

/*
 * ============================================================
 * MODAL: CREAR CLAN
 * ============================================================
 */

if (
  interaction.isModalSubmit() &&
  interaction.customId === 'clan_create_modal'
) {
  const name = interaction.fields
    .getTextInputValue('clan_name')
    .trim();

  const minecraftUsername = interaction.fields
    .getTextInputValue('minecraft_username')
    .trim();

  const description = interaction.fields
    .getTextInputValue('description')
    .trim();

  const requirements =
    interaction.fields
      .getTextInputValue('requirements')
      .trim() || undefined;

  if (
    !name ||
    !minecraftUsername ||
    !description
  ) {
    await interaction.reply({
      content:
        '❌ Debes completar todos los campos obligatorios.',
      ephemeral: true,
    });

    return;
  }

  const existingClan =
    await this.clansService.getClanByMember(
      interaction.user.id,
    );

  if (existingClan) {
    await interaction.reply({
      content:
        `❌ Ya perteneces al clan **${existingClan.name}**.\n` +
        `No puedes crear otro clan.`,
      ephemeral: true,
    });

    return;
  }

  await interaction.deferReply({
    ephemeral: true,
  });

  try {
    const clan =
      await this.clansService.createClan({
        name,
        description,
        requirements,
        leaderDiscordId: interaction.user.id,
        minecraftUsername,
        maxMembers: 20,
      });

    const forumChannel =
      await this.clansPanelService.getForumChannel(
        interaction.client,
      );

    const threadId =
      await this.clansPanelService.createClanForumPost(
        clan,
        forumChannel,
      );

    await this.clansService.setForumThreadId(
      clan.id,
      threadId,
    );

    await interaction.editReply({
      content:
        `🎉 **¡Clan creado correctamente!**\n\n` +
        `🏯 Clan: **${clan.name}**\n` +
        `👑 Líder: <@${interaction.user.id}>\n` +
        `👥 Miembros: **1/${clan.maxMembers}**\n\n` +
        `Tu clan ha sido publicado automáticamente en el foro.`,
    });
  } catch (error) {
    this.logger.error(
      'Error creando clan',
      error,
    );

    if (interaction.deferred) {
      await interaction.editReply({
        content:
          '❌ No se pudo crear el clan. Inténtalo nuevamente.',
      });
    }
  }

  return;
}
      /*
       * ============================================================
       * MODAL: CREAR POSTULACIÓN
       * ============================================================
       */

      if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith('clan_application_modal_')
      ) {
        const clanId = Number(
          interaction.customId.replace(
            'clan_application_modal_',
            '',
          ),
        );

        if (!Number.isInteger(clanId)) {
          await interaction.reply({
            content: '❌ El clan indicado no es válido.',
            ephemeral: true,
          });
          return;
        }

        const minecraftUsername = interaction.fields
          .getTextInputValue('minecraft_username')
          .trim();

        const reason = interaction.fields
          .getTextInputValue('reason')
          .trim();

        if (!minecraftUsername || !reason) {
	  await interaction.reply({
	    content:
	      '❌ Debes completar todos los campos de la postulación.',
	    ephemeral: true,
	  });
	  return;
	}

	await interaction.deferReply({
	  ephemeral: true,
	});

	const clan = await this.clansService.getClanById(clanId);

        const application =
          await this.clansService.createApplication({
            clanId: clan.id,
            applicantDiscordId: interaction.user.id,
            minecraftUsername,
            reason,
          });

        /*
         * DM AL LÍDER
         */

        try {
          const leader = await interaction.client.users.fetch(
            clan.leaderDiscordId,
          );

          const embed = new EmbedBuilder()
            .setTitle('📨 Nueva postulación a tu clan')
            .setDescription(
              `Un jugador quiere formar parte de **${clan.name}**.`,
            )
            .addFields(
              {
                name: '👤 Usuario',
                value: `<@${interaction.user.id}>`,
                inline: true,
              },
              {
                name: '🎮 Minecraft',
                value: minecraftUsername,
                inline: true,
              },
              {
                name: '📝 Motivo',
                value: reason,
              },
            )
            .setFooter({
              text: `Postulación #${application.id}`,
            })
            .setTimestamp();

          const buttons =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `clan_application_accept_${application.id}`,
                )
                .setLabel('Aceptar')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success),

              new ButtonBuilder()
                .setCustomId(
                  `clan_application_reject_${application.id}`,
                )
                .setLabel('Rechazar')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger),
            );

          await leader.send({
            embeds: [embed],
            components: [buttons],
          });
        } catch (error) {
          this.logger.warn(
            `No se pudo enviar DM al líder del clan ${clan.id}.`,
          );
        }

        /*
         * DM AL POSTULANTE
         */

        try {
          await interaction.user.send(
            `📨 **Postulación enviada correctamente**\n\n` +
              `Tu postulación para **${clan.name}** fue enviada al líder del clan.\n\n` +
              `🎮 Minecraft: **${minecraftUsername}**\n` +
              `⏳ Estado: **Pendiente**`,
          );
        } catch (error) {
          this.logger.warn(
            `No se pudo enviar DM al postulante ${interaction.user.id}.`,
          );
        }

        await interaction.editReply({
  content:
    `✅ Tu postulación para **${clan.name}** fue enviada correctamente.\n\n` +
    `El líder revisará tu solicitud y recibirás un mensaje cuando sea procesada.`,
});

        return;
      }

      /*
       * ============================================================
       * BOTÓN: ACEPTAR / RECHAZAR
       * ============================================================
       */

      if (
        interaction.isButton() &&
        (
          interaction.customId.startsWith(
            'clan_application_accept_',
          ) ||
          interaction.customId.startsWith(
            'clan_application_reject_',
          )
        )
      ) {
        const isAccept =
          interaction.customId.startsWith(
            'clan_application_accept_',
          );

        const prefix = isAccept
          ? 'clan_application_accept_'
          : 'clan_application_reject_';

        const applicationId = Number(
          interaction.customId.replace(prefix, ''),
        );

        if (!Number.isInteger(applicationId)) {
          await interaction.reply({
            content: '❌ La postulación indicada no es válida.',
            ephemeral: true,
          });
          return;
        }

        const application =
          await this.clansService.getApplicationById(
            applicationId,
          );

        const clan = await this.clansService.getClanById(
          application.clanId,
        );

        /*
         * SOLO EL LÍDER PUEDE PROCESARLA
         */

        if (
          clan.leaderDiscordId !== interaction.user.id
        ) {
          await interaction.reply({
            content:
              '❌ **No tienes permiso para procesar esta postulación.**\n' +
              'Solo el líder del clan puede aceptarla o rechazarla.',
            ephemeral: true,
          });
          return;
        }

        const status = isAccept
          ? 'accepted'
          : 'rejected';

        const result =
          await this.clansService.processApplication(
            applicationId,
            interaction.user.id,
            status,
          );

        /*
         * ACTUALIZAR EL MENSAJE DEL DM DEL LÍDER
         */

        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                isAccept
                  ? '✅ Postulación aceptada'
                  : '❌ Postulación rechazada',
              )
              .setDescription(
                `La postulación para **${result.clan.name}** fue procesada.`,
              )
              .addFields(
                {
                  name: '👤 Usuario',
                  value: `<@${application.applicantDiscordId}>`,
                  inline: true,
                },
                {
                  name: '🎮 Minecraft',
                  value: application.minecraftUsername,
                  inline: true,
                },
                {
                  name: '📊 Estado',
                  value: isAccept
                    ? '✅ Aceptada'
                    : '❌ Rechazada',
                  inline: true,
                },
              )
              .setFooter({
                text: `Postulación #${application.id}`,
              })
              .setTimestamp(),
          ],
          components: [],
        });

        /*
         * DM AL POSTULANTE CON EL RESULTADO
         */

        try {
          const applicant =
            await interaction.client.users.fetch(
              application.applicantDiscordId,
            );

          if (isAccept) {
            await applicant.send(
              `🎉 **¡Tu postulación fue aceptada!**\n\n` +
                `El líder de **${result.clan.name}** aceptó tu solicitud.\n\n` +
                `🎮 Minecraft: **${application.minecraftUsername}**\n` +
                `👥 Miembros del clan: **${result.clan.memberCount}/${result.clan.maxMembers}**`,
            );
          } else {
            await applicant.send(
              `❌ **Tu postulación fue rechazada.**\n\n` +
                `El líder de **${result.clan.name}** rechazó tu solicitud.\n\n` +
                `🎮 Minecraft: **${application.minecraftUsername}**`,
            );
          }
        } catch (error) {
          this.logger.warn(
            `No se pudo enviar el resultado al postulante ${application.applicantDiscordId}.`,
          );
        }

        return;
      }
    } catch (error) {
      this.logger.error(
        'Error gestionando interacción de clan',
        error,
      );

      if (
        interaction.isRepliable() &&
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          content:
            '❌ Ocurrió un error al procesar esta acción.',
          ephemeral: true,
        });
      }
    }
  }
}
