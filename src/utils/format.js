/** "$" to "$$$$" from a 1–4 price level. */
export function formatPrice(priceLevel) {
  const clampedLevel = Math.max(1, Math.min(4, priceLevel || 1));
  return "$".repeat(clampedLevel);
}

/** Lot number with leading zeros: 3 -> "003". */
export function formatLotNumber(lotNumber) {
  return String(lotNumber || 0).padStart(3, "0");
}

/** "Chelsea Market, Manhattan" without empty parts. */
export function formatLocation(place) {
  return [place.neighborhood, place.borough].filter(Boolean).join(", ");
}

/** Adds https:// when the user typed a bare domain. */
export function normalizeUrl(rawUrl) {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return "";
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}
