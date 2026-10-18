// Local API on http://localhost:3001. Vite forwards /api here (see vite.config.js).
import "./loadEnv.js";
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { databaseLabel } from "./db.js";

const PORT = 3001;

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`API lista en http://localhost:${PORT}/api · Base de datos: ${databaseLabel}`);
});
