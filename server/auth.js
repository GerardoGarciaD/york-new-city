import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const SESSION_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.VERCEL) throw new Error("Falta SESSION_SECRET en las variables de entorno");
  return "solo-para-desarrollo-local";
}

/** Passwords are compared ignoring case and spaces around, like the old gate did. */
function normalize(password) {
  return password.trim().toLowerCase();
}

/** Stored as "salt:hash" so the plain password never touches the database. */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(normalize(password), salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, expectedHex] = storedHash.split(":");
  const expected = Buffer.from(expectedHex, "hex");
  const actual = await scryptAsync(normalize(password), salt, expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** A signed "player.expiry.signature" string. The phone keeps it and sends it with every request. */
export function createToken(player) {
  const payload = `${player}.${Date.now() + SESSION_DAYS * DAY_MS}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the player key, or null if the token is fake or expired. */
export function readToken(token) {
  const [player, expiry, signature] = (token || "").split(".");
  if (!player || !expiry || !signature) return null;
  const expected = Buffer.from(sign(`${player}.${expiry}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return Number(expiry) > Date.now() ? player : null;
}
