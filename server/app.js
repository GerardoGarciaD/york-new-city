import { Hono } from "hono";
import { createToken, readToken, verifyPassword } from "./auth.js";
import { db, ensureTables } from "./db.js";
import { geocodeLocation } from "./geocode.js";
import { isGoogleMapsLink, resolveMapLink } from "./mapsLink.js";

/**
 * The API. Same code runs locally (server/dev.js) and on Vercel (api/index.js).
 *   POST   /api/login         { player, password } -> { token, player }
 *   GET    /api/places        -> list
 *   POST   /api/places        placeData -> created place
 *   PATCH  /api/places/:id    changes -> updated place
 *   DELETE /api/places/:id
 *   POST   /api/maps/resolve  { url } -> { location, coordinates } from a Google Maps link
 */
export const app = new Hono().basePath("/api");

function createId() {
  return `place-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function rowToPlace(row) {
  return { ...JSON.parse(row.data), id: row.id };
}

function isHiddenFrom(place, player) {
  return Boolean(place.isSecret) && place.secretOwner !== player;
}

/** A secret place that isn't yours arrives as a sealed lot: no name, category, notes, link or status. */
function toVisiblePlace(place, player) {
  if (!isHiddenFrom(place, player)) return place;
  return { id: place.id, lot: place.lot, createdAt: place.createdAt, secretOwner: place.secretOwner, isSecret: true, isSealed: true };
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

async function requirePlayer(c, next) {
  const token = c.req.header("Authorization")?.replace(/^Bearer /, "");
  const player = readToken(token);
  if (!player) return c.json({ error: "Sesión vencida" }, 401);
  c.set("player", player);
  await next();
}

// Everything below needs a valid token.
app.use("/places/*", requirePlayer);
app.use("/maps/*", requirePlayer);

app.post("/maps/resolve", async (c) => {
  const { url } = await c.req.json().catch(() => ({}));
  if (typeof url !== "string" || !isGoogleMapsLink(url.trim())) return c.json({ error: "Ese no es un link de Google Maps" }, 400);
  const resolvedPlace = await resolveMapLink(url.trim()).catch(() => null);
  if (!resolvedPlace) return c.json({ error: "No pudimos leer ese link" }, 422);
  return c.json(resolvedPlace);
});

app.get("/places", async (c) => {
  const result = await db.execute("SELECT id, data FROM places ORDER BY created_at");
  return c.json(result.rows.map((row) => toVisiblePlace(rowToPlace(row), c.get("player"))));
});

/**
 * Point for the Gourmet Map. A pasted Google Maps link already brings exact coordinates;
 * otherwise the typed location is searched (only when it changed, so editing a rating stays fast).
 */
async function withSearchedCoordinates(placeData, previousPlace = null) {
  if (placeData.coordinates || !placeData.location) return { ...placeData, searchedCoordinates: null };
  if (previousPlace?.searchedCoordinates && previousPlace.location === placeData.location) return placeData;
  return { ...placeData, searchedCoordinates: await geocodeLocation(placeData.location) };
}

app.post("/places", async (c) => {
  const { id: _ignoredId, isSealed: _ignoredSealed, secretOwner: _ignoredOwner, searchedCoordinates: _ignoredPoint, ...requestedData } = await c.req.json();
  const player = c.get("player");
  // The owner of a secret is whoever is logged in, never what the form says.
  const ownedData = requestedData.isSecret
    ? { ...requestedData, isSecret: true, secretOwner: player, proposedBy: player }
    : { ...requestedData, isSecret: false };
  const placeData = await withSearchedCoordinates(ownedData);
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
  if (isHiddenFrom(currentPlace, c.get("player"))) return c.json({ error: "Este lote está sellado" }, 403);

  const { id: _ignoredId, isSealed: _ignoredSealed, secretOwner: _ignoredOwner, searchedCoordinates: _ignoredPoint, isSecret, ...changes } = await c.req.json();
  // A secret can be revealed (isSecret: false) but nothing can become secret after it was created.
  if (isSecret === false) changes.isSecret = false;
  const { id: _sameId, ...mergedData } = { ...currentPlace, ...changes };
  const touchesLocation = "location" in changes || "coordinates" in changes;
  const updatedData = touchesLocation ? await withSearchedCoordinates(mergedData, currentPlace) : mergedData;
  await db.execute({ sql: "UPDATE places SET data = ? WHERE id = ?", args: [JSON.stringify(updatedData), placeId] });
  return c.json({ ...updatedData, id: placeId });
});

app.delete("/places/:id", async (c) => {
  const placeId = c.req.param("id");
  const currentPlace = await findPlace(placeId);
  if (currentPlace && isHiddenFrom(currentPlace, c.get("player"))) return c.json({ error: "Este lote está sellado" }, 403);
  await db.execute({ sql: "DELETE FROM places WHERE id = ?", args: [placeId] });
  return c.body(null, 204);
});
