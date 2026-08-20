import { Inject, Injectable, Logger, OnModuleInit, OnApplicationBootstrap, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TicketsInteractionHandler } from './tickets/tickets-interaction.handler';
import { SuggestionsInteractionHandler } from './suggestions/suggestions-interaction.handler';
import { SuggestionStatus } from './suggestions/suggestion-status.enum';
import { ServerStatus } from './services/server-status.interface';
import { ServerStatusService } from './services/server-status.service';
import { SendPanelCommand } from './tickets/send-panel.command';
import { MessageListener } from './levels/listeners/message.listener';
import { LevelCommand } from './levels/commands/level.command';
import { RankCommand } from './levels/commands/rank.command';

import {
  APIEmbed,
  APIMessageTopLevelComponent,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
  ChannelType,
  Client,
  Events,
  ForumChannel,
  GatewayIntentBits,
  Guild,
  Message,
  JSONEncodable,
  MessageFlags,
  TextChannel,
  ThreadChannel,
  CacheType,
} from 'discord.js';
import { StatsCommand } from './player-stats/commands/stats.command';
import { TopstatsCommand } from './player-stats/commands/topstats.command';
import { LeaderboardsCommand } from './player-stats/commands/leaderboards.command';
import { SupportService } from './support/support.service';
import { LeaderboardEntry } from './player-stats/services/leaderboards-reader.service';

export const STATUS_TAG: Record<SuggestionStatus, string> = {
  [SuggestionStatus.PENDING]: 'Pendiente',
  [SuggestionStatus.APPROVED]: 'Aprobada',
  [SuggestionStatus.REJECTED]: 'Rechazada',
  [SuggestionStatus.IMPLEMENTED]: 'Implementada',
};

export interface SuggestionPayload {
  embeds: ReadonlyArray<APIEmbed | JSONEncodable<APIEmbed>>;
  components?: ReadonlyArray<APIMessageTopLevelComponent | JSONEncodable<APIMessageTopLevelComponent>>;
}

export interface SuggestionData {
  suggestion_number: number;
  content?: string;
}

@Injectable()
export class DiscordService implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(DiscordService.name);
  private readonly client: Client;
  private readonly botEnabled: boolean;
  private serverStatusMessageId: string | null = null;

  public isReady(): boolean {
  return this.client.isReady();
}

async fetchTextChannel(channelId: string): Promise<TextChannel | null> {
  const channel = await this.client.channels.fetch(channelId);

  if (!channel || !channel.isTextBased() || channel.type !== ChannelType.GuildText) {
    return null;
  }

  return channel as TextChannel;
}

  constructor(
    private readonly configService: ConfigService,
    private readonly supportService: SupportService,
    private readonly ticketsInteractionHandler: TicketsInteractionHandler,
    @Inject(forwardRef(() => SuggestionsInteractionHandler))
    private readonly suggestionsInteractionHandler: SuggestionsInteractionHandler,
    private readonly sendPanelCommand: SendPanelCommand,
    private readonly serverStatusService: ServerStatusService,
    private readonly statsCommand: StatsCommand,
    private readonly topstatsCommand: TopstatsCommand,
    private readonly leaderboardsCommand: LeaderboardsCommand,
    private readonly messageListener: MessageListener,
    private readonly levelCommand: LevelCommand,
    private readonly rankCommand: RankCommand,
  ) {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    this.botEnabled = Boolean(token);

    this.serverStatusMessageId =
      this.configService.get<string>('SERVER_STATUS_MESSAGE_ID') ?? null;

    this.logger.log(
      `SERVER_STATUS_MESSAGE_ID cargado: ${this.serverStatusMessageId ?? 'ninguno'}`,
    );

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.once(Events.ClientReady, async () => {
      this.logger.log(`Discord client ready as ${this.client.user?.tag}`);

      const commandData = {
        name: 'send-panel',
        description: 'Envía paneles del servidor o comunicados de eventos',
        options: [
          {
            name: 'soporte',
            description: 'Envía paneles de soporte interactivos',
            type: 1,
            options: [
              {
                name: 'tipo',
                description: 'Qué panel de soporte enviar',
                type: 3,
                required: true,
                choices: [
                  { name: 'Panel de Tickets', value: 'tickets' },
                  { name: 'Panel de Postulaciones', value: 'postulacion' },
                  { name: 'Panel de Sugerencias', value: 'sugerencias' },
                ],
              },
            ],
          },
          {
            name: 'comunicado',
            description: 'Envía un comunicado general del bot sin eventos',
            type: 1,
          },
          {
            name: 'reglas-discord',
            description: 'Publica el reglamento del servidor de Discord',
            type: 1,
          },
          {
            name: 'reglas-servidor',
            description: 'Publica el reglamento del servidor de Minecraft',
            type: 1,
          },
          {
            name: 'evento',
            description: 'Envía un panel de evento activo',
            type: 1,
            options: [
              {
                name: 'tipo',
                description: 'Selecciona el tipo de evento',
                type: 3,
                required: true,
                choices: [{ name: 'Multiplicador x2 EXP en Skills', value: 'skills_x2' }],
              },
              {
                name: 'horas_inicio',
                description: '¿En cuántas horas inicia? (0 si empieza ya mismo, 2 para dos horas)',
                type: 4,
                required: true,
              },
            ],
          },
        ],
      };

      const serverStatusCommandData = {
        name: 'send-panel-status',
        description: 'Publica el panel de estado del servidor',
      };

      const sendLevelInfoCommandData = new SlashCommandBuilder()
        .setName('send-level-info')
        .setDescription('Publica el panel informativo del sistema de niveles')
        .toJSON();

      try {
        await this.client.application?.commands.set([
          commandData,
          serverStatusCommandData,
          sendLevelInfoCommandData,
          this.statsCommand.getSlashCommand(),
          this.topstatsCommand.getSlashCommand(),
          this.leaderboardsCommand.getSlashCommand(),
          this.levelCommand.getSlashCommand(),
          this.rankCommand.getSlashCommand(),
        ]);

        this.logger.log(
          'Comandos slash /send-panel, /send-panel-status y /send-level-info registrados globalmente.',
        );
      } catch (error) {
        this.logger.error('Error al registrar el comando slash', error);
      }
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'send-level-info') {
          await this.executeSendLevelInfo(interaction);
          return;
        }

        if (interaction.commandName === 'send-panel-status') {
          try {
            await interaction.deferReply({
              flags: [MessageFlags.Ephemeral],
            });

            const status = await this.serverStatusService.getServerStatus();
            const messageId = await this.sendServerStatusPanel(status);

            await interaction.editReply({
              content:
                `✅ Panel de estado publicado correctamente.\n` +
                `ID del mensaje: \`${messageId}\``,
            });
          } catch (error) {
            this.logger.error('Error ejecutando /send-panel-status', error);
            await interaction.editReply({
              content: '❌ No se pudo publicar el panel de estado.',
            });
          }

          return;
        }

        if (interaction.commandName === 'send-panel') {
          try {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const subcomando = interaction.options.getSubcommand();

            if (subcomando === 'soporte') {
              const tipo = interaction.options.getString('tipo');
              await this.supportService.handleSendPanelCommand(interaction, tipo);
            } else if (subcomando === 'comunicado') {
              await this.supportService.handleSendPanelCommand(interaction, 'bot');
            } else if (subcomando === 'reglas-discord') {
              await this.sendPanelCommand.executeReglasDiscord(interaction);
            } else if (subcomando === 'reglas-servidor') {
              await this.sendPanelCommand.executeReglasServidor(interaction);
            } else if (subcomando === 'evento') {
              const tipoEvento = interaction.options.getString('tipo') ?? '';
              const horasParaInicio = interaction.options.getInteger('horas_inicio') ?? 0;

              if (!tipoEvento) {
                await interaction.editReply({
                  content: 'Error de validación: El tipo de evento es obligatorio y no puede estar vacío.',
                });
                return;
              }

              const fechaInicio = new Date();
              fechaInicio.setHours(fechaInicio.getHours() + horasParaInicio);
              const unixTimestamp = Math.floor(fechaInicio.getTime() / 1000);

              await this.supportService.handleSendEventPanel(
                interaction,
                tipoEvento,
                unixTimestamp,
              );
            }
          } catch (error) {
            this.logger.error('Error ejecutando /send-panel', error);
            await interaction.editReply({ content: 'Hubo un error al ejecutar el comando.' });
          }
          return;
        }
      }

      if (interaction.isChatInputCommand() && interaction.commandName === 'stats') {
        await this.statsCommand.execute(interaction);
        return;
      }

      if (interaction.isChatInputCommand() && interaction.commandName === 'topstats') {
        await this.topstatsCommand.execute(interaction);
        return;
      }

      if (interaction.isChatInputCommand() && interaction.commandName === 'leaderboards') {
        await this.leaderboardsCommand.execute(interaction);
        return;
      }

      if (interaction.isChatInputCommand() && interaction.commandName === 'level') {
        await this.levelCommand.execute(interaction);
        return;
      }

      if (interaction.isChatInputCommand() && interaction.commandName === 'rank') {
        await this.rankCommand.execute(interaction);
        return;
      }

      await this.ticketsInteractionHandler.handle(interaction);
      await this.suggestionsInteractionHandler.handle(interaction);
    });

    this.client.on(Events.MessageCreate, async (message: Message) => {
      if (message.author.bot) return;

      try {
        await this.messageListener.handleMessage(message);
        await this.supportService.handleMessage(message);
      } catch (error) {
        this.logger.error('Error handling message command', error);
      }
    });

    this.client.on(Events.Error, (error) => {
      this.logger.error('Discord client error', error);
    });

    if (!this.botEnabled) {
      this.logger.warn('Discord token is not configured. Discord bot is disabled.');
    }
  }

  async onModuleInit() {
    if (!this.botEnabled) return;
    const token = this.configService.get<string>('DISCORD_TOKEN');
    await this.client.login(token);
  }

  onApplicationBootstrap() {
    if (!this.botEnabled) return;

    setTimeout(() => {
      console.log('\n\x1b[36m%s\x1b[0m', '  ==========================================');
      console.log('\x1b[36m%s\x1b[0m', '  =  BOT DESARROLLADO POR: CILANTROSMOKER  =');
      console.log('\x1b[36m%s\x1b[0m', '  ==========================================\n');
    }, 500);
  }

  private buildServerStatusEmbed(status: ServerStatus): APIEmbed {
    const serverStatus = status.online ? '🟢 Online' : '🔴 Offline';
    const javaStatus = status.online ? '🟢 Online' : '🔴 Offline';
    const bedrockStatus = status.online ? '🟢 Online' : '🔴 Offline';
    const realPing = status.latency + 100;

    return {
      color: status.online ? 0x00ff00 : 0xff0000,
      title: '📊 Panel de Control - Estado del Servidor',
      description:
        'Monitoreo en tiempo real de la conectividad, versiones y rendimiento general de la comunidad.\n\n' +
        '📡 **Estado General**\n' +
        `${serverStatus}  •  ⏱ **Ping:** ${realPing}ms\n\n` +
        '🌐 **IP del Servidor**\n' +
        `\`\`\`${status.ip}\`\`\`\n` +
        '👥 **Jugadores Conectados**\n' +
        `\`${status.players} / ${status.maxPlayers}\` jugadores en línea`,
      fields: [
        {
          name: '☕ Java Edition',
          value: `${javaStatus}\nVersión: \`v${status.javaVersion}\``,
          inline: true,
        },
        {
          name: '📱 Bedrock Edition',
          value: `${bedrockStatus}\nVersión: \`v${status.bedrockVersion}\``,
          inline: true,
        },
      ],
      footer: {
        text:
          `Actualizado ${new Date().toLocaleTimeString('es-CL', {
            timeZone: 'America/Santiago',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })} • Koshi Village`,
      },
    };
  }

  private async sendServerStatusPanel(status: ServerStatus): Promise<string> {
    const channelId = this.configService.get<string>('SERVER_STATUS_CHANNEL_ID');

    if (!channelId) {
      throw new Error('SERVER_STATUS_CHANNEL_ID no está configurado');
    }

    const channel = await this.client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased() || !('send' in channel)) {
      throw new Error('SERVER_STATUS_CHANNEL_ID no es un canal de texto válido');
    }

    const message = await channel.send({
      embeds: [this.buildServerStatusEmbed(status)],
    });

    this.serverStatusMessageId = message.id;

    return message.id;
  }

  async updateServerStatusEmbed(status: ServerStatus): Promise<void> {
    try {
      const channelId = this.configService.get<string>('SERVER_STATUS_CHANNEL_ID');

      if (!channelId) {
        throw new Error('SERVER_STATUS_CHANNEL_ID no está configurado');
      }

      const channel = await this.client.channels.fetch(channelId);

      if (
        !channel ||
        !channel.isTextBased() ||
        !('messages' in channel) ||
        !('send' in channel)
      ) {
        throw new Error('SERVER_STATUS_CHANNEL_ID no es un canal de texto válido');
      }

      if (this.serverStatusMessageId) {
        const message = await channel.messages
          .fetch(this.serverStatusMessageId)
          .catch(() => null);

        if (message) {
          await message.edit({
            embeds: [this.buildServerStatusEmbed(status)],
          });

          return;
        }

        this.logger.warn(
          `No se encontró el mensaje ${this.serverStatusMessageId}. ` +
            'Buscando el panel automáticamente...',
        );

        this.serverStatusMessageId = null;
      }

      const messages = await channel.messages.fetch({
        limit: 100,
      });

      const existingPanel = messages.find((message) => {
        if (message.author.id !== this.client.user?.id) {
          return false;
        }

        const embed = message.embeds[0];

        return embed?.title === '📊 Panel de Control - Estado del Servidor';
      });

      if (existingPanel) {
        this.serverStatusMessageId = existingPanel.id;

        this.logger.log(
          `Panel de estado encontrado automáticamente: ${existingPanel.id}`,
        );

        await existingPanel.edit({
          embeds: [this.buildServerStatusEmbed(status)],
        });

        return;
      }

      this.logger.log(
        'No existe panel de estado. Creando uno automáticamente...',
      );

      const message = await channel.send({
        embeds: [this.buildServerStatusEmbed(status)],
      });

      this.serverStatusMessageId = message.id;

      this.logger.log(
        `Panel de estado creado automáticamente: ${message.id}`,
      );
    } catch (error) {
      this.logger.error(
        'Error actualizando el panel de estado del servidor',
        error,
      );
    }
  }

  async updateLeaderboardMessage(
  channelId: string,
  messageId: string,
  leaderboard: LeaderboardEntry[],
): Promise<void> {
  try {
    const channel = await this.client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased() || !('messages' in channel)) {
      throw new Error(
        `El canal ${channelId} no es un canal de texto válido`,
      );
    }

    const message = await channel.messages.fetch(messageId);

    const medals = ['🥇', '🥈', '🥉'];

    const description = leaderboard
      .map((entry, index) => {
        const medal = medals[index] || '**';
        const hours = entry.score / 3600;

        return (
          `${medal} **#${entry.position} ${entry.playerName}**\n` +
          `${hours.toFixed(1).replace('.', ',')} horas`
        );
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 ⏱️ Tiempo Jugado - Diario')
      .setDescription(description)
      .setColor(0xffd700)
      .setTimestamp();

    await message.edit({
      embeds: [embed],
    });

    this.logger.log(
      `✅ Ranking diario actualizado correctamente. Mensaje: ${messageId}`,
    );
  } catch (error) {
    this.logger.error(
      `❌ Error actualizando ranking diario. Mensaje: ${messageId}`,
      error,
    );
  }
}


  isForum(
    channel: TextChannel | ForumChannel | ThreadChannel | null | undefined,
  ): channel is ForumChannel {
    return channel?.type === ChannelType.GuildForum;
  }

  private findTagId(channel: ForumChannel, tagName: string): string | null {
    const tag = channel.availableTags.find((t) => t.name === tagName);
    return tag?.id ?? null;
  }

  async postSuggestion(
    channel: TextChannel | ForumChannel,
    sug: SuggestionData,
    payload: SuggestionPayload,
  ) {
    if (this.isForum(channel)) {
      const base = String(sug.content || '').replace(/\s+/g, ' ').trim();
      const name =
        `Sugerencia #${sug.suggestion_number} — ${base}`.slice(0, 100) ||
        `Sugerencia #${sug.suggestion_number}`;
      const tagId = this.findTagId(channel, STATUS_TAG[SuggestionStatus.PENDING]);
      const thread = await channel.threads.create({
        name,
        message: { embeds: payload.embeds, components: payload.components },
        appliedTags: tagId ? [tagId] : [],
      });
      const message = await thread.fetchStarterMessage().catch(() => null);
      return { message, thread, messageId: message?.id ?? thread.id };
    }

    const message = await channel.send({
      embeds: payload.embeds,
      components: payload.components,
    });
    return { message, thread: null, messageId: message.id };
  }

  async fetchSuggestionMessage(
    guild: Guild,
    channel: TextChannel | ForumChannel,
    messageId: string,
  ) {
    if (!channel || !messageId) return null;

    if (this.isForum(channel)) {
      const thread = await this.findThread(guild, messageId);
      if (!thread) return null;
      if (thread.archived) await thread.setArchived(false).catch(() => {});
      return thread
        .fetchStarterMessage()
        .catch(() =>
          thread.messages
            .fetch(messageId)
            .catch(() => null),
        );
    }

    return channel.messages.fetch(messageId).catch(() => null);
  }

  async applyStatusTag(
    guild: Guild,
    channel: TextChannel | ForumChannel,
    messageId: string,
    status: SuggestionStatus,
  ) {
    if (!this.isForum(channel)) return;
    const tagId = this.findTagId(channel, STATUS_TAG[status]);
    if (!tagId) return;
    const thread = await this.findThread(guild, messageId);
    if (thread?.setAppliedTags)
      await thread.setAppliedTags([tagId]).catch(() => {});
  }

  private async findThread(
    guild: Guild,
    messageId: string,
  ): Promise<ThreadChannel | null> {
    const channel = await guild.channels.fetch(messageId).catch(() => null);
    if (!channel) return null;
    if (
      ![
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
      ].includes(channel.type)
    ) {
      return null;
    }
    return channel as ThreadChannel;
  }

  async executeSendLevelInfo(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const channelId = this.configService.get<string>('LEVELS_INFO_CHANNEL_ID');
    if (!channelId) {
      return interaction.reply({
        content:
          '❌ No se encontró el canal de información de niveles. Revisa LEVELS_INFO_CHANNEL_ID en el .env.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const targetChannel = await this.client.channels
      .fetch(channelId)
      .catch(() => null);
    if (!targetChannel || !targetChannel.isTextBased() || !('send' in targetChannel)) {
      return interaction.reply({
        content:
          '❌ LEVELS_INFO_CHANNEL_ID no es un canal de texto válido.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle('═══ SISTEMA DE NIVELES ═══')
      .setDescription(
        `**Koshi Village**
Tu actividad dentro de Discord ahora tiene recompensa.
A medida que participes en la comunidad y acumules **XP**, irás subiendo de nivel y desbloqueando nuevas categorías, roles y beneficios.
━━━━━━━━━━━━━━━━━━━━
## ◆ ¿Cómo funciona?
**» Participa en la comunidad**
Cada vez que participes activamente en Discord puedes obtener XP.
**» Acumula XP**
Mientras más participes, más XP conseguirás y más cerca estarás del siguiente nivel.
**» Sube de nivel**
Al alcanzar determinados niveles ascenderás a una nueva categoría y recibirás su rol correspondiente.
**» Desbloquea beneficios**
Cada categoría puede incluir nuevas funciones y beneficios dentro del servidor.
> ※ El sistema busca premiar la **actividad real dentro de la comunidad**. El spam o el uso abusivo del sistema no será considerado una forma válida de progresar.
━━━━━━━━━━━━━━━━━━━━
# ◆ CATEGORÍAS
## ◇ Aprendiz
**Nivel 1 — 10**
Tu camino dentro de Koshi Village comienza aquí.
**Rol:** \`Aprendiz\`
**Beneficios**
> » Acceso a las funciones básicas del servidor.
> » Participación en la comunidad.
> » Progreso mediante el sistema de XP.
━━━━━━━━━━━━━━━━━━━━
## ⚔ Guerrero
**Nivel 11 — ...**
Has demostrado actividad y permanencia dentro de la comunidad. A partir de este punto comienzas a desbloquear nuevas funciones.
**Rol:** \`Guerrero\`
**Beneficios**
> » Poder enviar GIFs en los canales generales.
> » Acceso a funciones adicionales de expresión dentro de Discord.
> » Rol exclusivo de Guerrero.
> ※ Llegar a Guerrero significa que ya has formado parte activa de la comunidad. ¡Sigue avanzando para descubrir qué hay más arriba!
━━━━━━━━━━━━━━━━━━━━
# ◆ ¿Y DESPUÉS?
El sistema seguirá contando tu progreso a medida que avances por las diferentes categorías.
Cada nuevo rango representará un nuevo nivel de confianza, participación y reconocimiento dentro de **Koshi Village**.
🔒 **Algunos beneficios se irán desbloqueando en categorías superiores.**
**¿Hasta dónde eres capaz de llegar?**
━━━━━━━━━━━━━━━━━━━━
### ※ IMPORTANTE
El sistema de niveles está diseñado para premiar la participación y convivencia dentro de la comunidad.
**×** No hagas spam para conseguir XP.
**×** No abuses de las funciones desbloqueadas.
**×** No intentes aprovechar errores del sistema.
El incumplimiento de las reglas puede implicar la retirada de beneficios o sanciones independientemente del nivel alcanzado.
**Koshi Village**`,
      )
      .setThumbnail(interaction.guild?.iconURL() ?? null)
      .setImage('attachment://linea_negra_y_rosa.gif')
      .setFooter({
        text: 'Koshi Village • Sistema de Niveles',
      })
      .setTimestamp();

    const attachment = new AttachmentBuilder(
      'dist/assets/images/linea_negra_y_rosa.gif',
    );

    await (targetChannel as TextChannel).send({
      embeds: [embed],
      files: [attachment],
    });

    return interaction.reply({
      content: `✅ Panel de niveles publicado en ${targetChannel}.`,
      flags: [MessageFlags.Ephemeral],
    });
  }

  public getClient(): Client {
    return this.client;
  }
}
