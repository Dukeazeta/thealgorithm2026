import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { adminUsers } from "@/db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_SEED_PASSWORD must be at least 8 characters.");
  }

  const database = getDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await database
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing[0]) {
    await database
      .update(adminUsers)
      .set({ passwordHash, updatedAt: new Date().toISOString() })
      .where(eq(adminUsers.id, existing[0].id));
    console.log(`Updated admin credentials for ${email}`);
    return;
  }

  await database.insert(adminUsers).values({
    id: crypto.randomUUID(),
    email,
    passwordHash,
  });
  console.log(`Created admin credentials for ${email}`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
