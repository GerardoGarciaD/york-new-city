/**
 * Reads a Google Maps link (long, the short maps.app.goo.gl one, or the newer share.google one)
 * and returns the place's name/address and, when the link has them, its exact coordinates.
 * share.google links land on a Google search for the place: those give the name but no coordinates.
 * Only ever requests Google hosts, so the API can't be used to fetch anything else.
 */
const GOOGLE_HOST = /^((www|maps)\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/i;
const SHORT_LINK_HOST = /^(maps\.app\.goo\.gl|goo\.gl|share\.google)$/i;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 5000;
const MAX_LOCATION_LENGTH = 160;
const COORDINATES_PATTERN = /^(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)$/;

function isAllowedUrl(url) {
  return url.protocol === "https:" && (GOOGLE_HOST.test(url.hostname) || SHORT_LINK_HOST.test(url.hostname));
}

export function isGoogleMapsLink(text) {
  try {
    const url = new URL(text);
    if (!isAllowedUrl(url)) return false;
    if (url.hostname.toLowerCase() === "goo.gl") return url.pathname.startsWith("/maps");
    return SHORT_LINK_HOST.test(url.hostname) || url.hostname.startsWith("maps.") || url.pathname.startsWith("/maps");
  } catch {
    return false;
  }
}

function decodePathPart(pathPart) {
  return decodeURIComponent(pathPart.replace(/\+/g, " ")).trim();
}

function readCoordinates(url) {
  // "!3d…!4d…" is the place's own pin; "@lat,lng" is only where the map was centered.
  const pinMatch = url.href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || url.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (pinMatch) return { lat: Number(pinMatch[1]), lng: Number(pinMatch[2]) };
  const queryMatch = (url.searchParams.get("q") || url.searchParams.get("query") || "").match(COORDINATES_PATTERN);
  return queryMatch ? { lat: Number(queryMatch[1]), lng: Number(queryMatch[2]) } : null;
}

function readPlaceText(url) {
  const pathParts = url.pathname.split("/");
  const placeIndex = pathParts.findIndex((pathPart) => pathPart === "place" || pathPart === "search");
  if (placeIndex >= 0 && pathParts[placeIndex + 1] && !pathParts[placeIndex + 1].startsWith("@")) return decodePathPart(pathParts[placeIndex + 1]);
  const queryText = url.searchParams.get("q") || url.searchParams.get("query") || "";
  return COORDINATES_PATTERN.test(queryText) ? "" : queryText.trim();
}

/** Only Maps pages and the search a share.google link lands on describe the place (not the redirect steps in between). */
function isPlacePage(url) {
  if (!GOOGLE_HOST.test(url.hostname)) return false;
  return url.hostname.toLowerCase().startsWith("maps.") || url.pathname.startsWith("/maps") || url.pathname === "/search";
}

/** Returns { location, coordinates } from a full Google Maps URL, or null if it says nothing useful. */
function parseFullMapsUrl(url) {
  if (!isPlacePage(url)) return null;
  const coordinates = readCoordinates(url);
  const placeText = readPlaceText(url);
  if (!placeText && !coordinates) return null;
  const location = (placeText || `${coordinates.lat}, ${coordinates.lng}`).slice(0, MAX_LOCATION_LENGTH);
  return { location, coordinates };
}

export async function resolveMapLink(link) {
  let currentUrl = new URL(link);
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (!isAllowedUrl(currentUrl)) return null;
    const parsedPlace = parseFullMapsUrl(currentUrl);
    if (parsedPlace) return parsedPlace;
    const response = await fetch(currentUrl, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const nextLocation = response.headers.get("location");
    if (!nextLocation) return null;
    currentUrl = new URL(nextLocation, currentUrl);
  }
  return null;
}
