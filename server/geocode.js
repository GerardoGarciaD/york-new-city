/**
 * Finds coordinates for a typed location ("Joe's Pizza, 7 Carmine St") with OpenStreetMap's Nominatim,
 * limited to New York City. Used for the Gourmet Map when a place has no exact pin from a Google Maps link.
 * Nominatim is free but asks for a real User-Agent and at most one request per second, which two travelers never reach.
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NEW_YORK_VIEWBOX = "-74.27,40.92,-73.68,40.49";
const MENTIONS_NEW_YORK = /new york|nueva york|nyc|\bny\b|manhattan|brooklyn|queens|bronx|staten island/i;
const REQUEST_TIMEOUT_MS = 5000;
const USER_AGENT = "viaje-a-york-new-city/1.0 (planificador de viaje personal)";

/** Returns { lat, lng } or null when nothing in New York matches (or the service doesn't answer). */
export async function geocodeLocation(location) {
  const trimmedLocation = (location || "").trim();
  if (!trimmedLocation) return null;
  const searchText = MENTIONS_NEW_YORK.test(trimmedLocation) ? trimmedLocation : `${trimmedLocation}, New York`;
  const searchParams = new URLSearchParams({ q: searchText, format: "jsonv2", limit: "1", viewbox: NEW_YORK_VIEWBOX, bounded: "1" });
  try {
    const response = await fetch(`${NOMINATIM_URL}?${searchParams}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "es,en" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const [firstMatch] = await response.json();
    return firstMatch ? { lat: Number(firstMatch.lat), lng: Number(firstMatch.lon) } : null;
  } catch {
    return null;
  }
}
