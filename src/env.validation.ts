import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DISCORD_TOKEN: Joi.string().optional(),
  SUGGESTIONS_CHANNEL_ID: Joi.string().optional(),
  SUPPORT_CHANNEL_ID: Joi.string().optional(),
  APPLICATIONS_CHANNEL_ID: Joi.string().optional(),
  CLAN_CHANNEL_ID: Joi.string().optional(),
  DATABASE_TYPE: Joi.string().valid('mysql', 'postgres').default('mysql'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql', 'mysql', 'mysql2'] }).required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().required(),
  PORT: Joi.number().default(3000),
});
