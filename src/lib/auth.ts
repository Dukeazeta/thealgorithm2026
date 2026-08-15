import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDatabase } from "@/db/client";
import { adminSessions, adminUsers } from "@/db/schema";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function sessionCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Host-algorithm-session"
    : "algorithm-session";
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not configured");
  return secret;
}

export async function createAdminSession(adminUserId: string) {
  sessionSecret();
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  await getDatabase().insert(adminSessions).values({
    id: crypto.randomUUID(),
    adminUserId,
    tokenHash: hashToken(token),
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;

  const rows = await getDatabase()
    .select({
      sessionId: adminSessions.id,
      userId: adminUsers.id,
      email: adminUsers.email,
      role: adminUsers.role,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") throw new UnauthorizedError();
  return session;
}

export async function loginAdmin(email: string, password: string) {
  const fingerprint = getRequestFingerprint(email.toLowerCase());
  const limit = await consumeRateLimit("admin-login", fingerprint, 10, 15 * 60 * 1000);
  if (!limit.allowed) throw new Error("Too many login attempts. Try again later.");

  const rows = await getDatabase()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password.");
  }

  await createAdminSession(user.id);
  return { id: user.id, email: user.email, role: user.role };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (token) {
    await getDatabase()
      .update(adminSessions)
      .set({ revokedAt: new Date().toISOString() })
      .where(eq(adminSessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(sessionCookieName());
}
