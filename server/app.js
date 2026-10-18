import { Hono } from "hono";
import { createToken, readToken, verifyPassword } from "./auth.js";
import { db, ensureTables } from "./db.js";

/**
 * The API. Same code runs locally (server/dev.js) and on Vercel (api/index.js).
 *   POST   /api/login        { player, password } -> { token, player }
 *   GET    /api/places       -> list
 *   POST   /api/places       placeData -> created place
 *   PATCH  /api/places/:id   changes -> updated place
 *   DELETE /api/places/:id
 */
export const app = new Hono().basePath("/api");

function createId() {
  return `place-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function rowToPlace(row) {
  return { ...JSON.parse(row.data), id: row.id };
}

async function findPlace(placeId) {
  const result = await db.execute({ sql: "SELECT id, data FROM places WHERE id = ?", args: [placeId] });
  return result.rows[0] ? rowToPlace(result.rows[0]) : null;
}

app.use(async (c, next) => {
  await ensureTables();
  await next();
});

app.post("/login", async (c) => {
  const { player, password } = await c.req.json().catch(() => ({}));
  if (typeof player !== "string" || typeof password !== "string") return c.json({ error: "Faltan datos" }, 400);

  const result = await db.execute({ sql: "SELECT password_hash FROM users WHERE player = ?", args: [player] });
  const user = result.rows[0];
  const isCorrect = user ? await verifyPassword(password, user.password_hash) : false;
  if (!isCorrect) return c.json({ error: "Contraseña incorrecta" }, 401);

  return c.json({ token: createToken(player), player });
});

// Everything below needs a valid token.
app.use("/places/*", async (c, next) => {
  const token = c.req.header("Authorization")?.replace(/^Bearer /, "");
  const player = readToken(token);
  if (!player) return c.json({ error: "Sesión vencida" }, 401);
  c.set("player", player);
  await next();
});

app.get("/places", async (c) => {
  const result = await db.execute("SELECT id, data FROM places ORDER BY created_at");
  return c.json(result.rows.map(rowToPlace));
});

app.post("/places", async (c) => {
  const { id: _ignoredId, ...placeData } = await c.req.json();
  const place = { ...placeData, id: createId() };
  await db.execute({
    sql: "INSERT INTO places (id, data, created_at) VALUES (?, ?, ?)",
    args: [place.id, JSON.stringify(placeData), placeData.createdAt || Date.now()],
  });
  return c.json(place, 201);
});

app.patch("/places/:id", async (c) => {
  const placeId = c.req.param("id");
  const currentPlace = await findPlace(placeId);
  if (!currentPlace) return c.json({ error: "No existe" }, 404);

  const { id: _ignoredId, ...changes } = await c.req.json();
  const { id: _sameId, ...updatedData } = { ...currentPlace, ...changes };
  await db.execute({ sql: "UPDATE places SET data = ? WHERE id = ?", args: [JSON.stringify(updatedData), placeId] });
  return c.json({ ...updatedData, id: placeId });
});

app.delete("/places/:id", async (c) => {
  await db.execute({ sql: "DELETE FROM places WHERE id = ?", args: [c.req.param("id")] });
  return c.body(null, 204);
});
