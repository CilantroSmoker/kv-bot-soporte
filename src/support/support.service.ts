import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { TicketEmbeds } from '../tickets/tickets.embeds';
import { buildCategoryRow, SuggestionEmbeds } from '../suggestions/suggestions.embeds';

import {
  ChannelType,
  ForumChannel,
  Guild,
  Message,
  TextChannel,
} from 'discord.js';

@Injectable()
export class SupportService {

  constructor(
    private readonly configService: ConfigService,
  ) {}

  // ====================================================================
  // METODO AUXILIAR: ENVIAR LOGS GENERALES
  // ====================================================================
  private async sendGeneralLog(guild: Guild, actionTitle: string, description: string, userTag: string) {
    const logsChannelId = this.configService.get<string>('DISCORD_LOGS_GENERALES_CHANNEL_ID');
    if (!logsChannelId) return; // Si no está configurado, ignora el log de forma silenciosa

    const logsChannel = await this.fetchChannel(guild, logsChannelId);
    if (!logsChannel || !('send' in logsChannel)) return;

    await logsChannel.send({
      embeds: [
        {
          title: `⚙ Log de Soporte: ${actionTitle}`,
          description: description,
          color: 0x3498db, // Azul informativo
          fields: [
            { name: '👤 Ejecutado por', value: userTag, inline: true },
            { name: '📅 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          ],
        }
      ]
    });
  }

  // ====================================================================
  // 1. MANEJADOR DEL COMANDO SLASH /send-panel
  // ====================================================================
  async handleSendPanelCommand(interaction: ChatInputCommandInteraction, tipo: string | null) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply({ content: 'Este comando solo se puede usar dentro de un servidor.' });
    }

    // Validar permisos del Staff
    const staffRoleId = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    
    const isStaffMember =
      member?.permissions.has('Administrator') ||
      (staffRoleId && member?.roles.cache.has(staffRoleId));

    if (!isStaffMember) {
      return interaction.editReply({ content: 'Solo el staff puede usar este comando.' });
    }

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased() || !('send' in channel)) {
      return interaction.editReply({ content: 'No se puede enviar el panel en este tipo de canal.' });
    }

    // Ejecutar la acción dependiendo de la opción seleccionada
    switch (tipo) {
       case 'tickets': {
          const attachment = new AttachmentBuilder('https://cdn.discordapp.com/attachments/1536248699707990056/1536295652714217603/abrir-ticket.png?ex=6a7ae252&is=6a7990d2&hm=00585a9f5f45cc0111271a16aeb89dd5f13160620c1ff9de4f19610a7b81ef15&', { name: 'ticket.png' });

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_open_soporte')
              .setLabel('Soporte')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🔵'),
            new ButtonBuilder()
              .setCustomId('ticket_open_apelacion')
              .setLabel('Apelación')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔴'),
          );

          // 1. Enviamos el GIF adjunto arriba
          await channel.send({
            files: [attachment],
          });

          // 2. Enviamos el embed (que ya trae todo el texto dentro) y los botones abajo
          await channel.send({
            embeds: [TicketEmbeds.panel()],
            components: [row]
          });

          await interaction.editReply({ content: '¡Panel de Tickets enviado con éxito!' });

          await this.sendGeneralLog(
            interaction.guild!,
            'Panel de Tickets Enviado',
            `Se ha desplegado el panel de soporte/apelaciones en el canal <#${channel.id}>.`,
            interaction.user.tag
          );
          break;
        }

        case 'postulacion': {
         const attachment = new AttachmentBuilder('https://cdn.discordapp.com/attachments/1536248699707990056/1536295518915928154/postulaciones.png?ex=6a7ae232&is=6a7990b2&hm=4e8f12df72e9bcd079538faa373760400d2a9cd5d1b15cf30dc2e66b44bf468b&', { name: 'postulaciones.png' });

         const rowPostulaciones = new ActionRowBuilder<ButtonBuilder>().addComponents(
           new ButtonBuilder()
             .setCustomId('ticket_open_postulacion')
             .setLabel('Postularse')
             .setStyle(ButtonStyle.Primary)
             .setEmoji('📝'),
         );

         await channel.send({ files: [attachment] });

         await channel.send({
           embeds: [TicketEmbeds.applicationPanel()],
           components: [rowPostulaciones]
         });

         await interaction.editReply({ content: '¡Panel de Postulaciones enviado con éxito!' });

         await this.sendGeneralLog(
           interaction.guild!,
           'Panel de Postulaciones Enviado',
           `Se ha desplegado el panel de postulaciones en el canal <#${channel.id}>.`,
           interaction.user.tag
         );
         break;
       }

	case 'sugerencias': {
        // Creamos el adjunto usando tu misma URL de Discord (o la ruta local si prefieres)
        const attachment = new AttachmentBuilder('https://cdn.discordapp.com/attachments/1536248699707990056/1536291588827775057/99324c87-11a1-419f-82f1-d7bc5e492770_1.png?ex=6a7ade89&is=6a798d09&hm=cda78dc313dd5911a6c471cbaf1fd975c69c3a41f25b1e2cb47e914fae09e464&', { name: 'sugerencias.png' });

        // 1. Enviamos el archivo adjunto puro arriba para que Discord lo despliegue en tamaño grande completo
        await channel.send({ 
          files: [attachment],
        });

        // 2. Enviamos el embed de texto y el menú desplegable justo abajo
        await channel.send({ 
          embeds: [SuggestionEmbeds.panel()], 
          components: [buildCategoryRow()] 
        });

        await interaction.editReply({ content: '¡Panel de Sugerencias enviado!' });

        await this.sendGeneralLog(
          guild, 
          'Panel de Sugerencias Enviado', 
          `Se ha desplegado el panel interactivo de sugerencias en el canal <#${channel.id}>.`, 
          interaction.user.tag
        );
        break;
      }

      case 'bot': {
        const comunicadoBot = 
          `# 📢 COMUNICADO OFICIAL DEL SISTEMA 📢\n\n` +
          `El sistema se encuentra operando con total normalidad. Ante cualquier reinicio programado o actualización de módulos de juego, les notificaremos por esta misma vía.\n\n` +
          `¡Gracias por formar parte de nuestra comunidad!`;

        await channel.send({ content: comunicadoBot });
        await interaction.editReply({ content: '¡Comunicado de sistema enviado!' });

        await this.sendGeneralLog(
          guild, 
          'Comunicado de Bot Enviado', 
          `Se envió un aviso de estado global del sistema en el canal <#${channel.id}>.`, 
          interaction.user.tag
        );
        break;
      }

      default: {
        await interaction.editReply({ content: 'Opción de panel no reconocida.' });
        break;
      }
    }
  }

  // ====================================================================
  // 2. MANEJADOR DE EVENTOS COMUNITARIOS
  // ====================================================================
  async handleSendEventPanel(interaction: ChatInputCommandInteraction, tipoEvento: string, unixTimestamp: number) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply({ content: 'Este comando solo se puede usar dentro de un servidor.' });
    }

    const staffRoleId = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    
    const isStaffMember =
      member?.permissions.has('Administrator') ||
      (staffRoleId && member?.roles.cache.has(staffRoleId));

    if (!isStaffMember) {
      return interaction.editReply({ content: 'Solo el staff puede usar este comando.' });
    }

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased() || !('send' in channel)) {
      return interaction.editReply({ content: 'No se puede enviar el panel en este tipo de canal.' });
    }

    let mensaje = '';
    let mencionRol = '';

    if (tipoEvento === 'evento_pvp') {
      const notificacionesRoleId = this.configService.get<string>('NOTIFICATIONS_ROLE_ID') ?? '';
      mencionRol = notificacionesRoleId ? `<@&${notificacionesRoleId}>` : '@Notificaciones';

      mensaje = `# **⚔ ¡TORNEO DE PVP: KOSHI VILLAGE! ⚔**\n` +
        `Nos alegra anunciar un nuevo evento oficial en nuestra comunidad. A continuación, les compartimos todos los detalles y la información clave sobre este enfrentamiento.\n\n` +
        `---\n\n` +
        `### **📌 INFORMACIÓN DEL EVENTO**\n` +
        `• **Modalidad:** Torneo de PvP competitivo.\n` +
        `• **Fecha y Hora:** <t:${unixTimestamp}:F>\n` +
        `• **Comienza:** <t:${unixTimestamp}:R>\n` +
        `---\n\n` +
        `### **⚔ FASES Y COMBATE**\n` +
        `El torneo se jugará por llaves de eliminación directa:\n\n` +
        `• **Octavos a Semifinales:** Se combatirá usando un kit estándar de diamante.\n` +
        `• **La Gran Final:** Los finalistas se disputarán el título usando el poderoso **Kit Elite**.\n\n` +
        `---\n\n` +
        `### **🏆 RECOMPENSAS Y PREMIOS**\n` +
        `**Podio de ganadores del torneo**\n\n` +
        `> **🥇 1er lugar (El Campeón)**\n` +
        `> • **15k** monedas\n` +
        `> • **x16** bloques de diamante\n` +
        `> • **x16** bloques de oro\n` +
        `> • **Rol** único dentro del servidor de discord: **(Campeón)** x 1 semana\n` +
        `> • **x1** pieza a elección del **kit Elite**\n` +
        `> • **x1** llave ONI\n` +
        `> • **x1** yelmo de diamante protección IV\n` +
        `> • **x1** pechera de diamante protección IV\n` +
        `> • **x1** grebas de diamante protección IV\n` +
        `> • **x1** botas de diamante protección IV\n\n` +
        `> **🥈 2do lugar (Subcampeón)**\n` +
        `> • **10k** monedas\n` +
        `> • **x8** bloques de diamante\n` +
        `> • **x8** bloques de oro\n` +
        `> • **x1** llave DIVINA\n` +
        `> • **x1** yelmo de diamante protección III\n` +
        `> • **x1** pechera de diamante protección III\n` +
        `> • **x1** grebas de diamante protección III\n` +
        `> • **x1** botas de diamante protección III\n\n` +
        `> **🥉 3er lugar**\n` +
        `> • **5k** de monedas\n` +
        `> • **x4** bloques de diamante\n` +
        `> • **x4** bloques de oro\n` +
        `> • **x1** llave IMPERIAL\n` +
        `> • **x1** yelmo de diamante\n` +
        `> • **x1** pechera de diamante\n` +
        `> • **x1** grebas de diamante\n` +
        `> • **x1** botas de diamante\n\n` +
        `---\n\n` +         
        `El torneo está abierto para todos y todas. ¡Cualquier duda o consulta, favor de abrir un **ticket**!`;
    }

    if (!mensaje) {
      return interaction.editReply({ content: 'El tipo de evento seleccionado no tiene una plantilla configurada.' });
    }

    // Enviamos el embed con la barra lateral de color y el spoiler del rol fuera o adjunto
    await channel.send({
      content: `||${mencionRol}||`,
      embeds: [
        {
          description: mensaje,
          color: 0x3498db,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Koshi Village • Evento Oficial'
          }
        }
      ]
    });

    await interaction.editReply({ content: '¡Panel de evento enviado de forma exitosa!' });

    await this.sendGeneralLog(
      guild,  
      'Evento de Comunidad Publicado',  
      `Se ha programado y enviado la publicación del evento **${tipoEvento}** en el canal <#${channel.id}>.`,  
      interaction.user.tag
    );
  }

  // ====================================================================
  // 3. PROCESAMIENTO DE MENSAJES (COMANDOS CON PREFIJO !)
  // ====================================================================
  async handleMessage(message: Message) {
    if (message.author.bot) return;
    const guild = message.guild;
    if (!guild) return;

    const text = message.content.trim();
    if (!text.startsWith('!')) return;

    const [command, ...args] = text.slice(1).split(' ');
    const payload = args.join(' ').trim();

    switch (command.toLowerCase()) {
      case 'panel-soporte':
        return this.sendTicketPanel(message, guild);
      case 'panel-postulacion':
        return this.sendApplicationPanel(message, guild);
      case 'panel-sugerencias':
        return this.sendSuggestionsPanel(message, guild);
      case 'help':
        return this.sendHelp(message);
      case 'ticket':
        return this.createTicket(message, payload, guild);
      case 'postular':
      case 'apply':
        return this.createApplication(message, payload, guild);
      case 'clan':
      case 'reclutamiento':
        return this.createClanRequest(message, payload, guild);
      default:
        return;
    }
  }

  private async sendTicketPanel(message: Message, guild: Guild) {
    const staffRoleId = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    const isStaffMember =
      message.member?.permissions.has('Administrator') ||
      (staffRoleId && message.member?.roles.cache.has(staffRoleId));

    if (!isStaffMember) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const channel = message.channel;
    if (!channel.isTextBased() || !('send' in channel)) return;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open_soporte')
        .setLabel('Soporte')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔵'),
      new ButtonBuilder()
        .setCustomId('ticket_open_apelacion')
        .setLabel('Apelación')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔴'),
    );

    await channel.send({ embeds: [TicketEmbeds.panel()], components: [row] });

    await this.sendGeneralLog(
      guild, 
      'Panel Tickets (!)', 
      `Se usó el comando de prefijo en <#${channel.id}> para lanzar el panel de soporte.`, 
      message.author.tag
    );
  }

  private async sendApplicationPanel(message: Message, guild: Guild) {
    const staffRoleId = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    const isStaffMember =
      message.member?.permissions.has('Administrator') ||
      (staffRoleId && message.member?.roles.cache.has(staffRoleId));

    if (!isStaffMember) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const channel = message.channel;
    if (!channel.isTextBased() || !('send' in channel)) return;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open_postulacion')
        .setLabel('Postularme')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📋'),
    );

    await channel.send({ embeds: [TicketEmbeds.applicationPanel()], components: [row] });

    await this.sendGeneralLog(
      guild, 
      'Panel Postulaciones (!)', 
      `Se usó el comando de prefijo en <#${channel.id}> para lanzar el panel de postulación.`, 
      message.author.tag
    );
  }

  private async sendSuggestionsPanel(message: Message, guild: Guild) {
    const staffRoleId = this.configService.get<string>('TICKETS_STAFF_ROLE_ID');
    const isStaffMember =
      message.member?.permissions.has('Administrator') ||
      (staffRoleId && message.member?.roles.cache.has(staffRoleId));

    if (!isStaffMember) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const channel = message.channel;
    if (!channel.isTextBased() || !('send' in channel)) return;

    await channel.send({ embeds: [SuggestionEmbeds.panel()], components: [buildCategoryRow()] });

    await this.sendGeneralLog(
      guild, 
      'Panel Sugerencias (!)', 
      `Se usó el comando de prefijo en <#${channel.id}> para lanzar el panel de sugerencias.`, 
      message.author.tag
    );
  }

  private async sendHelp(message: Message) {
    const helpText = `Hola ${message.author.username}, aquí tienes los comandos disponibles:\n\n` +
      `• **!help** - este mensaje de ayuda\n` +
      `• **!ticket <asunto> | <descripción>** - abre un ticket de soporte\n` +
      `• **!postular <mensaje>** - envía tu postulación al canal de postulaciones\n` +
      `• **!clan <texto>** - envía tu reclutamiento de clan al canal de reclutamiento\n\n` +
      `Si necesitas algo urgente, usa **!ticket**.`;

    return message.reply({ content: helpText });
  }

  private async createTicket(message: Message, payload: string, guild: Guild) {
    const supportChannelId = this.configService.get<string>('discord.supportChannelId');
    if (!supportChannelId) {
      return message.reply('El canal de soporte no está configurado.');
    }

    const supportChannel = await this.fetchChannel(guild, supportChannelId);
    if (!supportChannel || supportChannel.type !== ChannelType.GuildText) {
      return message.reply('No se pudo encontrar el canal de soporte o no es un canal de texto válido.');
    }

    const [subject, description] = payload.split('|').map((part) => part?.trim() || '');
    const ticketSubject = subject || 'Soporte sin asunto';
    const ticketDescription = description || 'No se proporcionó descripción.';

    const ticketMessage = await supportChannel.send({
      content: `**Asunto:** ${ticketSubject}\n**Usuario:** ${message.author.tag}\n**Descripción:** ${ticketDescription}`,
    });

    const thread = await ticketMessage.startThread({
      name: `Ticket - ${message.author.username}`,
      autoArchiveDuration: 1440,
      reason: 'Nuevo ticket de soporte',
    });

    await message.reply(`Tu ticket se ha creado: ${thread.toString()}`);

    await this.sendGeneralLog(
      guild, 
      'Creación de Ticket (!ticket)', 
      `El usuario abrió un ticket mediante comando. Asunto: *${ticketSubject}*. Hilo creado: ${thread.toString()}`, 
      message.author.tag
    );
  }

  private async createApplication(message: Message, payload: string, guild: Guild) {
    const applicationsChannelId = this.configService.get<string>('discord.applicationsChannelId');
    if (!applicationsChannelId) {
      return message.reply('El canal de postulaciones no está configurado.');
    }

    const applicationsChannel = await this.fetchChannel(guild, applicationsChannelId);
    if (!applicationsChannel || !('send' in applicationsChannel)) {
      return message.reply('No se pudo encontrar el canal de postulaciones.');
    }

    const content = payload || 'Postulación enviada sin contenido.';
    await applicationsChannel.send({
      embeds: [
        {
          title: 'Nueva postulación',
          description: content,
          color: 0x0099ff,
          fields: [{ name: 'Usuario', value: message.author.tag }],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    await this.sendGeneralLog(
      guild, 
      'Envío de Postulación (!postular)', 
      `Se procesó una postulación de usuario en el canal de administración asignado.`, 
      message.author.tag
    );

    return message.reply('Tu postulación ha sido enviada al canal de postulaciones.');
  }

  private async createClanRequest(message: Message, payload: string, guild: Guild) {
    const clanChannelId = this.configService.get<string>('discord.clanChannelId');
    if (!clanChannelId) {
      return message.reply('El canal de reclutamiento de clanes no está configurado.');
    }

    const clanChannel = await this.fetchChannel(guild, clanChannelId);
    if (!clanChannel || !('send' in clanChannel)) {
      return message.reply('No se pudo encontrar el canal de reclutamiento de clanes.');
    }

    const content = payload || 'Solicitud de clan sin detalle.';
    await clanChannel.send({
      embeds: [
        {
          title: 'Reclutamiento de clan',
          description: content,
          color: 0x00ff99,
          fields: [{ name: 'Usuario', value: message.author.tag }],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    await this.sendGeneralLog(
      guild, 
      'Reclutamiento de Clan (!clan)', 
      `Un usuario envió una publicación para promocionar o buscar clan.`, 
      message.author.tag
    );

    return message.reply('Tu reclutamiento ha sido enviado al canal de clanes.');
  }

  private async fetchChannel(guild: Guild, channelId: string) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    return channel ?? null;
  }
}
