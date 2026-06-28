// Retries a database call when it fails for a *transient* reason — most
// commonly a Supabase project waking up from auto-pause (free tier pauses
// after inactivity), or a pooled connection that was dropped server-side.
// Non-transient errors (bad query, constraint violation, etc.) are thrown
// immediately on the first attempt.

const RETRYABLE_PATTERNS = [
  'econnrefused',
  'etimedout',
  'enotfound',
  "can't reach database server",
  'connection terminated',
  'connection error',
  'connection timeout',
  'timeout expired',
  'too many clients',
  'server closed the connection',
];

function isRetryableError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return RETRYABLE_PATTERNS.some(pattern => message.includes(pattern));
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1500;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === attempts;

      if (!isRetryableError(error) || isLastAttempt) {
        throw error;
      }

      console.warn(
        `[db-retry] Transient DB error on attempt ${attempt}/${attempts}, retrying in ${baseDelayMs * attempt}ms…`,
        error instanceof Error ? error.message : error
      );
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * attempt));
    }
  }

  // Unreachable, but keeps TypeScript happy.
  throw lastError;
}
