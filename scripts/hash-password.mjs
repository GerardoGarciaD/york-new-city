// Usage: npm run hash-password -- nuevaContraseña
// Prints the SHA-256 fingerprint to paste into src/config/auth.js (PASSWORD_HASH).
import { createHash } from "node:crypto";

const newPassword = process.argv[2];

if (!newPassword) {
  console.error("Escribe la contraseña nueva: npm run hash-password -- nuevaContraseña");
  process.exit(1);
}

const fingerprint = createHash("sha256").update(newPassword.trim().toLowerCase()).digest("hex");
console.log(`\nPega esto en src/config/auth.js como PASSWORD_HASH:\n\n${fingerprint}\n`);
