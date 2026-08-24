import { z } from 'zod';

/**
 * Validated at import time so the app fails fast at boot with a clear message
 * instead of failing confusingly mid-request when a var is missing later.
 * Vars are added here as each phase introduces them (DB, auth, AI, ...).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  AUTH_SECRET: z.string().min(1, 'Generate one with: npx auth secret'),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
});
