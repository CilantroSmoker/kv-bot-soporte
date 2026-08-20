import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { ChannelType, EmbedBuilder, Guild, TextChannel } from 'discord.js';

@Injectable()
export class DiscordLogsService implements OnApplicationBootstrap {
  constructor(
    private readonly discordService: DiscordService,
    private readonly configService: ConfigService,
  ) {}

  onApplicationBootstrap() {
    const client = this.discordService.getClient(); 
    if (!client) {
      console.log('❌ [LOGS-SERVICE] No se pudo obtener el cliente de Discord al arrancar.');
      return;
    }

    const getLogsChannel = async (guild: Guild | null) => {
      const channelId = this.configService.get<string>('DISCORD_LOGS_GENERALES_CHANNEL_ID');
      if (!channelId || !guild) return null;
      const channel = await guild.channels.fetch(channelId).catch(() => null);
      return channel && 'send' in channel ? (channel as TextChannel) : null;
    };

    // ====== EVENTOS ======
    client.on('channelCreate', async (channel) => {
      if (!('guild' in channel) || !channel.guild) return;
      const logsChannel = await getLogsChannel(channel.guild as Guild);
      if (!logsChannel) return;
      const embed = new EmbedBuilder()
        .setTitle('📁 Canal / Ticket Creado')
        .setColor(0x2ecc71)
        .addFields(
          { name: '📍 Canal', value: `<#${channel.id}> (\`${'name' in channel ? channel.name : 'desconocido'}\`)` },
          { name: '📁 Tipo', value: `\`${channel.type}\`` }
        )
        .setFooter({ text: `ID: ${channel.id} • ${new Date().toLocaleString()}` });
      await logsChannel.send({ embeds: [embed] }).catch(() => null);
    });

    client.on('threadCreate', async (thread) => {
      if (!thread.guild) return;
      const logsChannel = await getLogsChannel(thread.guild as Guild);
      if (!logsChannel) return;
      const embed = new EmbedBuilder()
        .setTitle('🧵 Nuevo Hilo / Ticket Creado')
        .setColor(0x3498db)
        .addFields(
          { name: '📍 Hilo', value: `<#${thread.id}> (\`${thread.name}\`)` },
          { name: '📂 Canal Padre', value: thread.parentId ? `<#${thread.parentId}>` : 'Ninguno' }
        )
        .setFooter({ text: `ID: ${thread.id} • ${new Date().toLocaleString()}` });
      await logsChannel.send({ embeds: [embed] }).catch(() => null);
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
      if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;
      if (!oldMessage.guild) return;
      const logsChannel = await getLogsChannel(oldMessage.guild as Guild);
      if (!logsChannel) return;
      const embed = new EmbedBuilder()
        .setTitle('📝 Mensaje Editado')
        .setColor(0xf1c40f)
        .addFields(
          { name: '👤 Autor', value: oldMessage.author ? `<@${oldMessage.author.id}>` : 'Desconocido', inline: true },
          { name: '📍 Canal', value: `<#${oldMessage.channel.id}>`, inline: true },
          { name: '◀️ Antes', value: oldMessage.content?.slice(0, 1024) || '*Contenido no disponible*' },
          { name: '▶️ Después', value: newMessage.content?.slice(0, 1024) || '*Contenido vacío*' }
        )
        .setFooter({ text: `ID: ${oldMessage.id} • ${new Date().toLocaleString()}` });
      await logsChannel.send({ embeds: [embed] }).catch(() => null);
    });

    client.on('channelUpdate', async (oldChannel, newChannel) => {
      if (oldChannel.type === ChannelType.DM || !('guild' in oldChannel) || !oldChannel.guild) return;
      const logsChannel = await getLogsChannel(oldChannel.guild as Guild);
      if (!logsChannel) return;
      const oldTopic = 'topic' in oldChannel ? (oldChannel.topic as string | null) : null;
      const newTopic = 'topic' in newChannel ? (newChannel.topic as string | null) : null;
      if (oldTopic !== newTopic) {
        const embed = new EmbedBuilder()
          .setTitle('🔧 Canal Modificado')
          .setColor(0x34495e)
          .addFields(
            { name: '📍 Canal', value: `<#${newChannel.id}> (\`${'name' in newChannel ? newChannel.name : 'canal'}\`)` },
            { name: '📋 Tema / Estado', value: `\`${oldTopic || 'Ninguno'}\` ➔ \`${newTopic || 'Ninguno'}\`` }
          )
          .setFooter({ text: `ID: ${newChannel.id} • ${new Date().toLocaleString()}` });
        await logsChannel.send({ embeds: [embed] }).catch(() => null);
      }
    });

    client.on('channelDelete', async (channel) => {
      if (!('guild' in channel) || !channel.guild) return;
      const logsChannel = await getLogsChannel(channel.guild as Guild);
      if (!logsChannel) return;
      const embed = new EmbedBuilder()
        .setTitle('🗑️ Canal Eliminado')
        .setColor(0xe74c3c)
        .addFields(
          { name: '📍 Canal', value: `#${'name' in channel ? channel.name : 'desconocido'}` },
          { name: '📁 Tipo', value: `\`${channel.type}\`` }
        )
        .setFooter({ text: `ID: ${channel.id} • ${new Date().toLocaleString()}` });
      await logsChannel.send({ embeds: [embed] }).catch(() => null);
    });

    client.on('guildMemberUpdate', async (oldMember, newMember) => {
      if (!oldMember.guild) return;
      const logsChannel = await getLogsChannel(oldMember.guild as Guild);
      if (!logsChannel) return;
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      if (removedRoles.size === 0 && addedRoles.size === 0) return;
      const embed = new EmbedBuilder()
        .setTitle('🎭 Roles Actualizados')
        .setColor(0x9b59b6)
        .addFields({ name: '👤 Usuario', value: `<@${newMember.id}>` });
      if (addedRoles.size > 0) {
        embed.addFields({ name: '✅ Agregados', value: addedRoles.map(r => `<@&${r.id}>`).join(', ') });
      }
      if (removedRoles.size > 0) {
        embed.addFields({ name: '❌ Quitados', value: removedRoles.map(r => `<@&${r.id}>`).join(', ') });
      }
      embed.setFooter({ text: `ID: ${newMember.id} • ${new Date().toLocaleString()}` });
      await logsChannel.send({ embeds: [embed] }).catch(() => null);
    });
  }

  // ✨ MÉTODO PÚBLICO (FUERA DE onApplicationBootstrap)
  async sendCustomLog(title: string, description: string, color: number = 0x2ecc71) {
    const client = this.discordService.getClient();
    if (!client?.isReady()) {
      console.warn('⚠️ El cliente de Discord no está listo');
      return;
    }

    const guild = client.guilds.cache.first();
    if (!guild) {
      console.warn('⚠️ No hay servidores disponibles');
      return;
    }

    const channelId = this.configService.get<string>('DISCORD_LOGS_GENERALES_CHANNEL_ID');
    if (!channelId) return;

    const logsChannel = await guild.channels.fetch(channelId).catch(() => null) as TextChannel;
    if (!logsChannel) {
      console.warn('⚠️ Canal de logs no encontrado');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setFooter({ text: `${new Date().toLocaleString()}` });

    await logsChannel.send({ embeds: [embed] }).catch(() => null);
  }
}
