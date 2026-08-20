import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  Interaction,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  GuildMember,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import { TicketsService } from './tickets.service';
import { TicketsPermissions } from './tickets-permissions';
import { TicketEmbeds } from './tickets.embeds';
import { SendPanelCommand } from './send-panel.command';
import { TicketType } from './entities/ticket.entity';

@Injectable()
export class TicketsInteractionHandler {
  private readonly logger = new Logger(TicketsInteractionHandler.name);
  private readonly permissions: TicketsPermissions;

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly configService: ConfigService,
    private readonly sendPanelCommand: SendPanelCommand,
  ) {
    this.permissions = new TicketsPermissions(configService);
  }

  async handle(interaction: Interaction) {
    if (interaction.isButton()) return this.handleButton(interaction);
    if (interaction.isModalSubmit()) return this.handleModal(interaction);
    if (interaction.isChatInputCommand()) return this.handleCommand(interaction);
  }

  private async handleCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.commandName === 'send-panel') {
      const tipo = interaction.options.getString('tipo');
      if (tipo === 'tickets') {
        return this.sendPanelCommand.executeSendPanelTickets(interaction);
      }
      if (tipo === 'bot') {
        return this.sendPanelCommand.executeBotOperational(interaction);
      }
      if (tipo === 'reglas-discord') {
        return this.sendPanelCommand.executeReglasDiscord(interaction);
      }
      if (tipo === 'reglas-servidor') {
        return this.sendPanelCommand.executeReglasServidor(interaction);
      }
    }
  }

  private async handleButton(interaction: any) {
    const { customId, member, user } = interaction;
    if (!customId.startsWith('ticket_')) return;

    if (customId === 'ticket_open_soporte') return interaction.showModal(this.buildFullModal('soporte'));
    if (customId === 'ticket_open_apelacion') return interaction.showModal(this.buildFullModal('apelacion'));
    if (customId === 'ticket_open_postulacion') return interaction.showModal(this.buildFullModal('postulacion'));

    // Botón: Reclamar Ticket
    if (customId.startsWith('ticket_claim_')) {
      const ticketId = customId.replace('ticket_claim_', '');
      if (!this.permissions.isStaff(member)) {
        return interaction.reply({ embeds: [TicketEmbeds.error('Sin permisos', 'Solo el staff puede reclamar tickets.')], flags: [MessageFlags.Ephemeral] });
      }
      const ticket = await this.ticketsService.getTicketById(ticketId);
      if (!ticket || ticket.status !== 'open') {
        return interaction.reply({ embeds: [TicketEmbeds.error('Error', 'Ticket no encontrado o ya cerrado.')], flags: [MessageFlags.Ephemeral] });
      }
      if (ticket.claimed_by) {
        return interaction.reply({ embeds: [TicketEmbeds.warning('Ya reclamado', `Ya fue reclamado por <@${ticket.claimed_by}>`)], flags: [MessageFlags.Ephemeral] });
      }
      await this.ticketsService.claimTicket(ticketId, user.id);
      return interaction.reply({ embeds: [TicketEmbeds.success('Ticket reclamado', `${user} ha tomado este ticket.`)] });
    }

    // Botón: Iniciar Cierre de Ticket
    if (customId.startsWith('ticket_close_')) {
      const ticketId = customId.replace('ticket_close_', '');
      if (!this.permissions.isStaff(member)) {
        return interaction.reply({ embeds: [TicketEmbeds.error('Sin permisos', 'Solo el staff puede cerrar tickets.')], flags: [MessageFlags.Ephemeral] });
      }
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`ticket_confirm_close_${ticketId}`).setLabel('Confirmar cierre').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('ticket_cancel_close').setLabel('Cancelar').setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
      );
      return interaction.reply({ embeds: [TicketEmbeds.warning('¿Cerrar ticket?', 'El canal será eliminado en 5 segundos.')], components: [row], flags: [MessageFlags.Ephemeral] });
    }

    // Botón: Confirmar Cierre Real
    if (customId.startsWith('ticket_confirm_close_')) {
      const ticketId = customId.replace('ticket_confirm_close_', '');
      const { guild } = interaction;
      const ticket = await this.ticketsService.getTicketById(ticketId);
      if (!ticket || ticket.status !== 'open') {
        return interaction.reply({ embeds: [TicketEmbeds.error('Error', 'Ticket no encontrado o ya cerrado.')], flags: [MessageFlags.Ephemeral] });
      }
      await interaction.deferUpdate();
      await this.ticketsService.closeTicket(ticketId, user.id);
      const channel = guild?.channels.cache.get(ticket.channel_id);
      if (channel && channel.type === ChannelType.GuildText) {
        await (channel as TextChannel).send({ embeds: [TicketEmbeds.ticketClosed(ticket, user.tag)] });
        setTimeout(() => channel.delete('Ticket cerrado').catch(() => {}), 5000);
      }
      return;
    }

    if (customId === 'ticket_cancel_close') {
      return interaction.update({ content: 'Cierre cancelado.', embeds: [], components: [] });
    }
  }

  private async handleModal(interaction: any) {
    const { customId, user, guild } = interaction;
    if (!customId.startsWith('ticket_modal_')) return;

    const type = customId.replace('ticket_modal_', '') as TicketType;
    const member = interaction.member as GuildMember;

    if (!guild || !member) return;

    // Capturar todos los campos del modal
    const minecraftUsername = interaction.fields.getTextInputValue('minecraft_username');
    const version = interaction.fields.getTextInputValue('version').toUpperCase();
    const platform = interaction.fields.getTextInputValue('platform').toUpperCase();
    const subject = interaction.fields.getTextInputValue('subject');
    const description = interaction.fields.getTextInputValue('description');

    // Usar flags para respuesta efímera en modales
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // Verificar si ya tiene un ticket abierto
    const existing = await this.ticketsService.getOpenTicketByUser(user.id, guild.id, type);
    if (existing) {
      return interaction.editReply({
        embeds: [TicketEmbeds.error('Ticket ya abierto', `Tienes un ticket activo en: <#${existing.channel_id}>`)],
      });
    }

    // Configurar permisos iniciales del canal
    const overrides: any[] = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ]
      },
    ];

    // Validar que el rol de Staff exista realmente como rol cacheado en este guild
    const staffRole = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    if (staffRole && staffRole.trim() !== '') {
      const staffRoleId = staffRole.trim();
      if (guild.roles.cache.has(staffRoleId)) {
        overrides.push({
          id: staffRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ]
        });
      } else {
        this.logger.warn(`TICKETS_STAFF_ROLE_ID (${staffRoleId}) no existe como rol en el guild ${guild.id}. Revisa el .env.`);
      }
    } else {
      this.logger.warn('TICKETS_STAFF_ROLE_ID no está configurado en el .env o está vacío.');
    }

    // Filtrar y validar roles secundarios (viewer roles)
    const viewerRoles = this.permissions.getViewerRoles();
    if (Array.isArray(viewerRoles)) {
      for (const roleId of viewerRoles) {
        if (roleId && typeof roleId === 'string' && roleId.trim() !== '') {
          const cleanRoleId = roleId.trim();
          if (guild.roles.cache.has(cleanRoleId)) {
            overrides.push({
              id: cleanRoleId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ReadMessageHistory,
              ]
            });
          } else {
            this.logger.warn(`Viewer role (${cleanRoleId}) no existe como rol en el guild ${guild.id}, se omite.`);
          }
        }
      }
    }

    try {
      // ✨ CREAR TICKET PRIMERO en BD para obtener ticket_number
      const ticket = await this.ticketsService.createTicket({
        type,
        userId: user.id,
        guildId: guild.id,
        channelId: '', // Lo actualizamos después
        subject: subject,
        appealReason: description,
        minecraftUsername,
        platform: version,
        device: platform,
      });

      // ✨ AHORA crear el canal CON EL NÚMERO DEL TICKET
      const channelOpts: any = {
	    name: `tkt-${type}-${ticket.ticket_number}`,
        type: ChannelType.GuildText,
        topic: `📌 Asunto: ${subject}`,
        permissionOverwrites: overrides,
      };

      const categoryId = this.configService.get<string>('TICKETS_CATEGORY_ID');
      if (categoryId && categoryId.trim() !== '') {
        channelOpts.parent = categoryId.trim();
      }

      // Crear canal
      const channel = await guild.channels.create(channelOpts) as TextChannel;

      // ✨ ACTUALIZAR el channel_id del ticket
      await this.ticketsService.updateTicketChannelId(ticket.ticket_id, channel.id);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`ticket_claim_${ticket.ticket_id}`).setLabel('Reclamar').setStyle(ButtonStyle.Primary).setEmoji('🙋'),
        new ButtonBuilder().setCustomId(`ticket_close_${ticket.ticket_id}`).setLabel('Cerrar').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
      );

      const staffMention = (staffRole && staffRole.trim() !== '') ? `<@&${staffRole}>` : '';
      await channel.send({
        content: `${member} ${staffMention}`,
        embeds: [TicketEmbeds.ticketOpen(ticket, user.tag, user.displayAvatarURL())],
        components: [row],
      });

      let dataText = '';

if (type === 'postulacion') {
  dataText = `👤 **Nick:** ${minecraftUsername}\n🎓 **Experiencia:** ${version}`;
} else if (type === 'soporte') {
  dataText = `👤 **Nick:** ${minecraftUsername}\n📦 **Versión:** ${version}\n💻 **Plataforma:** ${platform}`;
} else if (type === 'apelacion') {
  dataText = `👤 **Nick:** ${minecraftUsername}\n📱 **Plataforma:** ${platform}`;
}
const successEmbed = new EmbedBuilder()
  .setColor(0x23a55a)
  .setTitle('✅ Ticket Creado')
  .setDescription(`Tu ticket ha sido generado en: ${channel}\n\n**Tus Datos:**\n${dataText}`);
await interaction.editReply({ embeds: [successEmbed] });
} catch (error) {
  this.logger.error('Error al crear el ticket:', error);
  await interaction.editReply({
    embeds: [TicketEmbeds.error('Error', 'No se pudo crear el ticket debido a un problema interno.')],
  });
}
}
        
private buildFullModal(type: TicketType): ModalBuilder {
  if (type === 'postulacion') {
    return this.buildPostulacionModal();
  } else {
    return this.buildTicketModal(type);
  }
}
      
private buildTicketModal(type: TicketType): ModalBuilder {
  const isApeal = type === 'apelacion';
  const modal = new ModalBuilder()
    .setCustomId(`ticket_modal_${type}`)
    .setTitle(isApeal ? '📋 Abrir Apelación' : '🔵 Ticket de Soporte');

  // 1. Nickname
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('minecraft_username')
        .setLabel('Nickname de Minecraft')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(16)
        .setPlaceholder('Ej: CilantroSmoker')
        .setRequired(true),
    ),
  );

  // 2. Versión
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('version')
        .setLabel('Versión del Juego')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(15)
        .setPlaceholder('Escribe: Java o Bedrock')
        .setRequired(true),
    ),
  );

  // 3. Plataforma
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('platform')
        .setLabel('¿En qué juegas? (Plataforma)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setPlaceholder('Ej: PC, Consola, Móvil')
        .setRequired(true),
    ),
  );

  // 4. Asunto
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('subject')
        .setLabel('Asunto')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(30)
        .setPlaceholder('Ej: Ban injustificado, Error en tienda')
        .setRequired(true),
    ),
  );
  // 5. Descripción
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('description')
        .setLabel(isApeal ? 'Motivo de la apelación' : 'Descripción del problema')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1000)
        .setPlaceholder('Detalla tu situación aquí de forma clara...')
        .setRequired(true),
    ),
  );

  return modal;
}

private buildPostulacionModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('ticket_modal_postulacion')
    .setTitle('🟢 Postulación Staff');

  // 1. User del maicra
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('minecraft_username')
        .setLabel('Nickname de Minecraft')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(16)
        .setPlaceholder('Ej: CilantroSmoker')
        .setRequired(true),
    ),
  );

  // 2. Experiencia
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('version')
        .setLabel('¿Tienes experiencia como moderador?')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(50)
        .setPlaceholder('Ej: 2 años en servidor X')
        .setRequired(true),
    ),
  );

  // 3. Disponibilidad
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('platform')
        .setLabel('¿Cuántas horas disponibles por semana?')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(50)
        .setPlaceholder('Ej: 15-20 horas')
        .setRequired(true),
    ),
  );

  // 4. Asunto (por qué quieres ser staff)
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('subject')
        .setLabel('¿Por qué quieres ser Staff?')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setPlaceholder('Ej: Quiero ayudar a la comunidad')
        .setRequired(true),
    ),
  );

  // 5. Motivación extra
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Cuéntanos un poco más sobre ti')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1000)
        .setPlaceholder('Detalla tus habilidades, por qué eres buena opción, etc...')
        .setRequired(true),
    ),
  );

  return modal;
}
}