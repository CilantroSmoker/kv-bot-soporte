import { EmbedBuilder } from 'discord.js';
import { Ticket } from './entities/ticket.entity';

const COLOR = {
  TICKET: 0x3498db,
  APPLY: 0x9b59b6,
};

function truncate(str: string, max = 1000): string {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

export const TicketEmbeds = {
  panel: () =>
    new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎫  ᴄᴇɴᴛʀᴏ ᴅᴇ ᴀᴛᴇɴᴄɪᴏɴ  🎫')
      .setDescription(
        '**¿Necesitas ayuda o quieres apelar una sanción? El equipo de administración está listo para atenderte.**\n\u200b\n' +
        '> 🔵 **Soporte:** Dudas, problemas técnicos y consultas generales.\n' +
        '> 🔴 **Apelación:** Recursos contra sanciones (bans, mutes, etc.).\n\u200b\n' +
        '-# 💡 Selecciona el botón correspondiente abajo para abrir un canal privado.',
      )
      .setFooter({ text: 'Koshi Village • Sistema de Soporte Oficial' })
      .setTimestamp(),

  applicationPanel: () =>
    new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📝  ᴘᴏsᴛᴜʟᴀᴄɪᴏɴᴇs  📝')
      .setDescription(
        '**¿Quieres formar parte del equipo o de nuestra comunidad oficial? Revisa los requisitos y postúlate abajo.**\n\u200b\n' +
        '> 📋 **Postulación General:** Envía tu solicitud para unirte a nuestros rangos o proyectos.\n\u200b\n' +
        '-# 💡 Solo se aceptan postulaciones serias. Presiona el botón de abajo para comenzar.',
      )
      .setFooter({ text: 'Koshi Village • Sistema de Postulaciones' })
      .setTimestamp(),

  selectPlatform: () =>
    new EmbedBuilder()
      .setColor(0x3498db)
      .setDescription('¿En qué plataforma juegas?')
      .setFooter({ text: 'Presiona uno de los botones' }),

  selectDevice: () =>
    new EmbedBuilder()
      .setColor(0x3498db)
      .setDescription('¿Desde qué dispositivo juegas?')
      .setFooter({ text: 'Presiona uno de los botones' }),

  ticketOpen: (ticket: Ticket, userTag: string, userAvatar: string) => {
  const typeLabel =
    ticket.type === 'soporte'
      ? 'SOPORTE'
      : ticket.type === 'apelacion'
        ? 'APELACIÓN'
        : 'POSTULACIÓN';

  const color =
    ticket.type === 'postulacion'
      ? COLOR.APPLY
      : COLOR.TICKET;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: userTag,
      iconURL: userAvatar,
    })
    .setTitle(`Ticket #${ticket.ticket_number}`)
    .setDescription(
      `\`\`\`${typeLabel}\`\`\`\n` +
      `**Asunto**\n${ticket.subject || 'Sin asunto'}`
    )
    .addFields(
      {
        name: 'Estado',
        value: '`Abierto`',
        inline: true,
      },
      {
        name: 'Usuario',
        value: `<@${ticket.user_id}>`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: true,
      },
    );

  /*
   * Cada tipo de ticket utiliza los campos de la BD
   * de una manera diferente.
   */
  if (ticket.type === 'postulacion') {
    embed.addFields(
      {
        name: 'Username Minecraft',
        value: ticket.minecraft_username || 'No especificado',
        inline: true,
      },
      {
        name: 'Experiencia',
        value: ticket.platform || 'No especificada',
        inline: true,
      },
      {
        name: 'Disponibilidad',
        value: ticket.device || 'No especificada',
        inline: true,
      },
      {
        name: 'Por qué quieres ser Staff',
        value: ticket.subject || 'No especificado',
        inline: false,
      },
      {
        name: 'Información adicional',
        value: ticket.appeal_reason
          ? truncate(ticket.appeal_reason)
          : 'No especificada',
        inline: false,
      },
    );
  } else if (ticket.type === 'soporte') {
    embed.addFields(
      {
        name: 'Username Minecraft',
        value: ticket.minecraft_username || 'No especificado',
        inline: true,
      },
      {
        name: 'Versión',
        value: ticket.platform || 'No especificada',
        inline: true,
      },
      {
        name: 'Plataforma',
        value: ticket.device || 'No especificada',
        inline: true,
      },
      {
        name: 'Descripción',
        value: ticket.appeal_reason
          ? truncate(ticket.appeal_reason)
          : 'No especificada',
        inline: false,
      },
    );
  } else if (ticket.type === 'apelacion') {
    embed.addFields(
      {
        name: 'Username Minecraft',
        value: ticket.minecraft_username || 'No especificado',
        inline: true,
      },
      {
        name: 'Plataforma',
        value: ticket.device || 'No especificada',
        inline: true,
      },
      {
        name: 'Motivo',
        value: ticket.appeal_reason
          ? truncate(ticket.appeal_reason)
          : 'No especificado',
        inline: false,
      },
    );
  }

  return embed
    .setFooter({
      text: `ID: ${ticket.ticket_id}`,
    })
    .setTimestamp();
},

  ticketClosed: (ticket: any, closedByTag: string) =>
    new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔒 Ticket Cerrado')
      .setDescription(`**Cerrado por:** ${closedByTag}`)
      .setTimestamp(),

  error: (title: string, desc: string) =>
    new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(`❌  ${title}`)
      .setDescription(desc),

  success: (title: string, desc: string) =>
    new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`✅  ${title}`)
      .setDescription(desc),

  warning: (title: string, desc: string) =>
    new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`⚠️  ${title}`)
      .setDescription(desc),

  botOperational: () =>
    new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🟢 Sistema Operativo')
      .setDescription('Los servicios de tickets operan con normalidad.')
      .setFooter({ text: 'Sistema de soporte • Actualizado' })
      .setTimestamp(),

  botOperationalSimple: () =>
    new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🟢 Operativo')
      .setDescription('Todas las funciones operan correctamente.')
      .setFooter({ text: 'Todas las funciones disponibles' })
      .setTimestamp()
};
