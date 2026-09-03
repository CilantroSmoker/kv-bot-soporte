export default () => ({
  discord: {
    token: process.env.DISCORD_TOKEN,
    suggestionsChannelId: process.env.SUGGESTIONS_CHANNEL_ID,
    supportChannelId: process.env.SUPPORT_CHANNEL_ID,
    applicationsChannelId: process.env.APPLICATIONS_CHANNEL_ID,
    clanChannelId: process.env.CLAN_CHANNEL_ID,
  },
  database: {
    type: (process.env.DATABASE_TYPE || 'mysql') as 'mysql' | 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  },
});
