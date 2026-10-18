import { createClient } from "@libsql/client";

/**
 * The database. Locally it is a single file (server/data/yorknew.db).
 * Online it is Turso: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.
 *
 * Two tables:
 *   users  — the two travelers (player key + password fingerprint). No sign-up: create them with yarn db:user.
 *   places — each place as JSON, so new fields in the form need no database change.
 */
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:server/data/yorknew.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/** Shown by the scripts so it's clear where data is going. */
export const databaseLabel = process.env.TURSO_DATABASE_URL ? "Turso (en la nube)" : "archivo local server/data/yorknew.db";

let tablesReady = null;

export function ensureTables() {
  tablesReady ??= db.batch(
    [
      "CREATE TABLE IF NOT EXISTS users (player TEXT PRIMARY KEY, password_hash TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS places (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at INTEGER NOT NULL)",
    ],
    "write",
  );
  return tablesReady;
}
