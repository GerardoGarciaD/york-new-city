import { apiRequest, UnauthorizedError } from "./api";

/**
 * Where places are saved: the shared database behind the API (server/app.js),
 * so both phones see the same list.
 *
 * The other phone's changes arrive by asking the server again every few seconds
 * and whenever the page comes back to the front.
 *   subscribe(onChange) -> unsubscribe
 *   addPlace(placeData)
 *   updatePlace(placeId, changes)
 *   removePlace(placeId)
 */
const REFRESH_EVERY_MS = 15000;

export function createApiPlacesRepository({ token, onUnauthorized }) {
  let places = [];
  const listeners = new Set();
  let refreshTimer = null;

  function commit(nextPlaces) {
    places = nextPlaces;
    listeners.forEach((listener) => listener(places));
  }

  async function request(path, options) {
    try {
      return await apiRequest(path, { ...options, token });
    } catch (error) {
      if (error instanceof UnauthorizedError) onUnauthorized();
      throw error;
    }
  }

  async function refresh() {
    try {
      commit(await request("/places"));
    } catch {
      // Offline or server hiccup: keep showing the last list and try again on the next tick.
    }
  }

  function refreshWhenVisible() {
    if (document.visibilityState === "visible") refresh();
  }

  function startRefreshing() {
    refresh();
    refreshTimer = setInterval(refreshWhenVisible, REFRESH_EVERY_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);
  }

  function stopRefreshing() {
    clearInterval(refreshTimer);
    document.removeEventListener("visibilitychange", refreshWhenVisible);
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      if (listeners.size === 1) startRefreshing();
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) stopRefreshing();
      };
    },
    async addPlace(placeData) {
      const createdPlace = await request("/places", { method: "POST", body: placeData });
      commit([...places, createdPlace]);
    },
    async updatePlace(placeId, changes) {
      const updatedPlace = await request(`/places/${encodeURIComponent(placeId)}`, { method: "PATCH", body: changes });
      commit(places.map((place) => (place.id === placeId ? updatedPlace : place)));
    },
    async removePlace(placeId) {
      await request(`/places/${encodeURIComponent(placeId)}`, { method: "DELETE" });
      commit(places.filter((place) => place.id !== placeId));
    },
  };
}
