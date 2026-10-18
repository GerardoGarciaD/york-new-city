// Usage: yarn db:seed
// Loads the example places from src/config/places.js, only if the list is empty.
import "../server/loadEnv.js";
import { databaseLabel, db, ensureTables } from "../server/db.js";
import { EXAMPLE_PLACES } from "../src/config/places.js";

console.log(`Base de datos: ${databaseLabel}`);
await ensureTables();
const { rows } = await db.execute("SELECT COUNT(*) AS total FROM places");

if (rows[0].total > 0) {
  console.log("La lista ya tiene lugares, no se agregó nada.");
} else {
  await db.batch(
    EXAMPLE_PLACES.map(({ id, ...placeData }) => ({
      sql: "INSERT INTO places (id, data, created_at) VALUES (?, ?, ?)",
      args: [id, JSON.stringify(placeData), placeData.createdAt],
    })),
    "write",
  );
  console.log(`Listo: ${EXAMPLE_PLACES.length} lugares de ejemplo agregados.`);
}
