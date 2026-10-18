const UNKNOWN_PRICE = "¿$?";

/** "$" to "$$$$" from a 1–4 price level, or "¿$?" while nobody has been there to know. */
export function formatPrice(priceLevel) {
  if (!priceLevel) return UNKNOWN_PRICE;
  const clampedLevel = Math.max(1, Math.min(4, priceLevel));
  return "$".repeat(clampedLevel);
}

/** Lot number with leading zeros: 3 -> "003". */
export function formatLotNumber(lotNumber) {
  return String(lotNumber || 0).padStart(3, "0");
}

/** Adds https:// when the user typed a bare domain. */
export function normalizeUrl(rawUrl) {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return "";
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}
