const MENTIONS_NEW_YORK = /new york|nueva york|nyc|\bny\b|manhattan|brooklyn|queens|bronx|staten island/i;
const GOOGLE_MAPS_LINK = /^https:\/\/(maps\.app\.goo\.gl\/|goo\.gl\/maps|share\.google\/|(www\.|maps\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+\/)/i;
const EXACT_PIN_ZOOM = 17;

/** True when the text is a pasted Google Maps link (long or the short one the phone shares). */
export function looksLikeGoogleMapsLink(text) {
  return GOOGLE_MAPS_LINK.test(text.trim());
}

/** Adds "New York" when the text doesn't say where, so Google doesn't drop the pin in another city. */
function toSearchText(location) {
  const trimmedLocation = location.trim();
  return MENTIONS_NEW_YORK.test(trimmedLocation) ? trimmedLocation : `${trimmedLocation}, New York`;
}

/**
 * Google Maps embedded in an iframe. No API key needed.
 * With coordinates (from a pasted link) the pin is exact; otherwise Google searches the text.
 */
export function buildMapEmbedUrl({ location, coordinates }) {
  if (coordinates) return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=${EXACT_PIN_ZOOM}&output=embed`;
  return `https://www.google.com/maps?q=${encodeURIComponent(toSearchText(location))}&output=embed`;
}

/** Opens the phone's maps app (or Google Maps on a computer): the pasted link if there is one, else a search. */
export function buildOpenInMapsUrl({ location, mapsLink }) {
  if (mapsLink) return mapsLink;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(toSearchText(location))}`;
}
