import { useEffect, useMemo, useState } from "react";
import { createApiPlacesRepository } from "../services/placesRepository";

/** Live list of places plus the actions to change it. Loads nothing until there is a session token. */
export function usePlaces({ token, onUnauthorized }) {
  const repository = useMemo(
    () => (token ? createApiPlacesRepository({ token, onUnauthorized }) : null),
    [token, onUnauthorized],
  );
  const [places, setPlaces] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setPlaces([]);
    setIsLoaded(false);
    if (!repository) return undefined;
    const unsubscribe = repository.subscribe((latestPlaces) => {
      setPlaces(latestPlaces);
      setIsLoaded(true);
    });
    return unsubscribe;
  }, [repository]);

  const nextLotNumber = places.reduce((highestLot, place) => Math.max(highestLot, place.lot || 0), 0) + 1;

  return {
    places,
    isLoaded,
    nextLotNumber,
    addPlace: repository?.addPlace,
    updatePlace: repository?.updatePlace,
    removePlace: repository?.removePlace,
  };
}
