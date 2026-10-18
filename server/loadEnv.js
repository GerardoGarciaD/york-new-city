import { mkdirSync } from "node:fs";

/** Reads .env if there is one, and makes sure the local database folder exists. Import this first. */
try {
  process.loadEnvFile();
} catch {
  // No .env: local defaults are used.
}

mkdirSync("server/data", { recursive: true });
