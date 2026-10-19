// Usage: yarn db:geocode
// Finds the Gourmet Map point for places saved before the map existed (they have a location but no point).
// Run it once. Waits a bit between searches, as OpenStreetMap asks.
import "../server/loadEnv.js";
import { databaseLabel, db, ensureTables } from "../server/db.js";
import { geocodeLocation } from "../server/geocode.js";

const PAUSE_BETWEEN_SEARCHES_MS = 1100;

console.log(`Base de datos: ${databaseLabel}`);
await ensureTables();
const { rows } = await db.execute("SELECT id, data FROM places");
const placesToSearch = rows
  .map((row) => ({ id: row.id, ...JSON.parse(row.data) }))
  .filter((place) => place.location && !place.coordinates && !place.searchedCoordinates);

if (placesToSearch.length === 0) console.log("No hay lugares pendientes de ubicar.");

for (const { id, ...placeData } of placesToSearch) {
  const searchedCoordinates = await geocodeLocation(placeData.location);
  if (searchedCoordinates) {
    await db.execute({ sql: "UPDATE places SET data = ? WHERE id = ?", args: [JSON.stringify({ ...placeData, searchedCoordinates }), id] });
    console.log(`✓ ${placeData.name}: ${searchedCoordinates.lat}, ${searchedCoordinates.lng}`);
  } else {
    console.log(`✗ ${placeData.name}: no se encontró "${placeData.location}". Agreguen la calle desde la app.`);
  }
  await new Promise((resolve) => setTimeout(resolve, PAUSE_BETWEEN_SEARCHES_MS));
}
