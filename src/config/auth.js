/**
 * Shared password, stored as a SHA-256 fingerprint (current password: "yorknew").
 * To change it run:  npm run hash-password -- nuevaContraseña
 * and paste the result here. This is a friendly gate, not real security.
 */
export const PASSWORD_HASH = "ad5498e9a54515a3ee22f6a1bb637a261a0a4024701a52700f4fb8daaba00971";

/** Where the logged-in player is remembered in the browser. */
export const SESSION_STORAGE_KEY = "yorknew-session";
