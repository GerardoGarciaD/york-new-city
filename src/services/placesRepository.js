import { EXAMPLE_PLACES } from "../config/places";
import { readStorage, writeStorage } from "../utils/safeStorage";

/**
 * Where places are saved. This version uses the browser's localStorage,
 * so each browser keeps its own list.
 *
 * To share the list between devices later (Supabase, Firebase…), write another
 * object with these same four functions and swap it in usePlaces.js:
 *   subscribe(onChange) -> unsubscribe
 *   addPlace(placeData)
 *   updatePlace(placeId, changes)
 *   removePlace(placeId)
 */
const STORAGE_KEY = "york-new-city-places";

function loadPlaces() {
  const savedText = readStorage(STORAGE_KEY);
  if (savedText === null) return EXAMPLE_PLACES;
  try {
    const savedPlaces = JSON.parse(savedText);
    return Array.isArray(savedPlaces) ? savedPlaces : [];
  } catch {
    return [];
  }
}

function createId() {
  return `place-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createLocalPlacesRepository() {
  let places = loadPlaces();
  const listeners = new Set();

  function commit(nextPlaces) {
    places = nextPlaces;
    writeStorage(STORAGE_KEY, JSON.stringify(places));
    listeners.forEach((listener) => listener(places));
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      onChange(places);
      return () => listeners.delete(onChange);
    },
    async addPlace(placeData) {
      commit([...places, { ...placeData, id: createId() }]);
    },
    async updatePlace(placeId, changes) {
      commit(places.map((place) => (place.id === placeId ? { ...place, ...changes } : place)));
    },
    async removePlace(placeId) {
      commit(places.filter((place) => place.id !== placeId));
    },
  };
}
