import { z } from 'zod';

/**
 * Validated at import time so the app fails fast at boot with a clear message
 * instead of failing confusingly mid-request when a var is missing later.
 * Vars are added here as each phase introduces them (DB, auth, AI, ...).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
});
