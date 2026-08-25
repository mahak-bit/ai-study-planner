import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { env } from '@/lib/env';

const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });

/**
 * Single place the app depends on a concrete model provider. Swapping
 * providers later means changing this file only — every agent imports
 * `planningModel` (or a future `chatModel`), never a provider SDK directly.
 *
 * This project actually exercised that swap once already: it started on
 * OpenAI, then moved to Gemini (free tier, no billing required) without
 * touching any agent, schema, or service code — only this file and env.ts
 * changed.
 *
 * gemini-2.5-flash was tried first but is no longer available to new
 * accounts (confirmed by the API's own error message, which named the
 * replacement below) — gemini-3.6-flash is the current flash-tier model on
 * Google AI Studio's free tier, appropriate here since structured schedule
 * generation from a bounded context doesn't need frontier-level reasoning.
 */
export const planningModel = google('gemini-3.6-flash');

// Same model as planningModel for now -- kept as a separate export so the
// Coach's model choice can diverge later (e.g. faster/cheaper for chat)
// without touching the planning/progress agents.
export const chatModel = google('gemini-3.6-flash');
