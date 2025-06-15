import { config } from 'dotenv';
import { z } from 'zod';
import { zodErrorsFormatter } from '../../utils/zod-errors-formatter';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_CLIENT: z.enum(['sqlite', 'pg']).default('pg'),
  DB_URL: z.string(),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number(),
})

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  const errorMessage = zodErrorsFormatter(_env.error.issues);

  console.log('Invalid environment variables:', errorMessage);
  throw new Error('Invalid enviroment variables');
}

export const env = _env.data;