
import { db } from './db';
import { rateLimits } from './schema';
import { eq, sql, gt } from 'drizzle-orm';

/**
 * Checks rate limits using the DB 'rate_limits' table.
 * Returns { allowed: boolean, reason?: string }
 */
export const checkAbuse = async (
  sessionId: string,
  ipHash: string,
  uaHash: string,
  startupId: string
): Promise<{ allowed: boolean; reason?: string }> => {
  const now = new Date();
  
  // 1. Duplicate Vote Block (Handled by DB constraint unique(startupId, sessionId), checked in route)

  // Combined fingerprint
  const fingerprint = `${ipHash}:${uaHash}`;

  // Helper to check and increment limit
  const checkLimit = async (key: string, limit: number, windowSeconds: number): Promise<boolean> => {
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
    
    // Upsert logic: if exists and not expired, increment. if expired or new, reset.
    // Drizzle with PostgreSQL:
    // We will do a transaction: get, check, update/insert.
    
    // 1. Get current
    const current = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
    const entry = current[0];

    if (!entry) {
      // Create new
      await db.insert(rateLimits).values({
        key,
        count: 1,
        expiresAt
      });
      return true;
    }

    if (entry.expiresAt < now) {
      // Expired, reset
      await db.update(rateLimits)
        .set({ count: 1, expiresAt })
        .where(eq(rateLimits.key, key));
      return true;
    }

    if (entry.count >= limit) {
      return false; // Limit exceeded
    }

    // Increment
    await db.update(rateLimits)
      .set({ count: entry.count + 1 })
      .where(eq(rateLimits.key, key));
      
    return true;
  };

  // 2. Min Interval > 1s (Global per session)
  const minIntervalKey = `min_int:${sessionId}`;
  if (!(await checkLimit(minIntervalKey, 1, 1))) {
    return { allowed: false, reason: 'Too fast' };
  }

  // 3. Burst Limit (Max 3 votes / 10s)
  const burstKey = `burst:${sessionId}`;
  if (!(await checkLimit(burstKey, 3, 10))) {
    return { allowed: false, reason: 'Burst limit exceeded (3/10s)' };
  }

  // 4. Soft Limit (Max 200 votes / 10min per fingerprint)
  const softKey = `soft:${fingerprint}`;
  if (!(await checkLimit(softKey, 200, 600))) {
    return { allowed: false, reason: 'Soft limit exceeded (200/10m)' };
  }

  // 5. Hard Limit (Max 500 votes / 10min per fingerprint)
  const hardKey = `hard:${fingerprint}`;
  if (!(await checkLimit(hardKey, 500, 600))) {
    return { allowed: false, reason: 'Hard limit exceeded (500/10m)' };
  }

  return { allowed: true };
};
