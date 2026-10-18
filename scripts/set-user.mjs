// Usage: yarn db:user LM contraseña
// Creates the traveler or changes their password. Use the same password for both if you want a shared one.
// Works on the database in .env (Turso) or, without it, on the local file.
import "../server/loadEnv.js";
import { hashPassword } from "../server/auth.js";
import { databaseLabel, db, ensureTables } from "../server/db.js";
import { PEOPLE, PLAYER_KEYS } from "../src/config/people.js";

const [typedName, newPassword] = process.argv.slice(2);
const player = PLAYER_KEYS.find((playerKey) => PEOPLE[playerKey].toLowerCase() === typedName?.toLowerCase());
const names = PLAYER_KEYS.map((playerKey) => PEOPLE[playerKey]).join(" o ");

if (!player || !newPassword) {
  console.error(`Escribe el nombre (${names}) y la contraseña: yarn db:user ${PEOPLE.firstPlayer} contraseña`);
  process.exit(1);
}

await ensureTables();
await db.execute({
  sql: "INSERT INTO users (player, password_hash) VALUES (?, ?) ON CONFLICT(player) DO UPDATE SET password_hash = excluded.password_hash",
  args: [player, await hashPassword(newPassword)],
});
console.log(`Listo: ${PEOPLE[player]} ya puede entrar con esa contraseña. Guardado en: ${databaseLabel}`);
