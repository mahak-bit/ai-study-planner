/**
 * Thrown by any agent when generation ultimately fails after retries.
 * `retryable` tells the caller whether trying again later is worth it
 * (e.g. a transient API error) vs. not (e.g. a persistently malformed
 * schema that won't fix itself).
 */
export class AgentError extends Error {
  retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = 'AgentError';
    this.retryable = retryable;
  }
}
