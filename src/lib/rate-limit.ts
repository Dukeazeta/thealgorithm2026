import { createHash } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { rateLimitBuckets } from "@/db/schema";

export function getRequestFingerprint(value: string) {
  const secret = process.env.AUTH_SESSION_SECRET ?? "development-fingerprint-secret";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

export async function consumeRateLimit(
  scope: string,
  fingerprint: string,
  max: number,
  windowMs: number,
) {
  const database = getDatabase();
  const now = Date.now();
  const windowStartedAt = Math.floor(now / windowMs) * windowMs;
  const existing = await database
    .select()
    .from(rateLimitBuckets)
    .where(
      and(
        eq(rateLimitBuckets.scope, scope),
        eq(rateLimitBuckets.fingerprint, fingerprint),
        eq(rateLimitBuckets.windowStartedAt, windowStartedAt),
      ),
    )
    .limit(1);

  if (!existing[0]) {
    await database.insert(rateLimitBuckets).values({
      id: crypto.randomUUID(),
      scope,
      fingerprint,
      windowStartedAt,
      count: 1,
    });
    return { allowed: true, retryAfter: Math.ceil((windowStartedAt + windowMs - now) / 1000) };
  }

  const nextCount = existing[0].count + 1;
  if (nextCount > max) {
    return { allowed: false, retryAfter: Math.ceil((windowStartedAt + windowMs - now) / 1000) };
  }

  await database
    .update(rateLimitBuckets)
    .set({ count: nextCount })
    .where(eq(rateLimitBuckets.id, existing[0].id));

  return { allowed: true, retryAfter: Math.ceil((windowStartedAt + windowMs - now) / 1000) };
}
