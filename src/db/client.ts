import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalForDatabase = globalThis as unknown as {
  database?: Database;
};

const tursoFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  if (!response.ok) {
    const body = await response
      .clone()
      .text()
      .catch(() => "Unable to read response body");
    console.error("Turso HTTP request failed", {
      status: response.status,
      body: body.slice(0, 2_000),
    });
  }

  return response;
};

export function getDatabase(): Database {
  if (globalForDatabase.database) return globalForDatabase.database;

  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not configured");
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    fetch: tursoFetch,
  });

  const database = drizzle(client, { schema });
  globalForDatabase.database = database;
  return database;
}
