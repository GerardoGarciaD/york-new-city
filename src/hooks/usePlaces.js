import { useEffect, useMemo, useState } from "react";
import { createLocalPlacesRepository } from "../services/placesRepository";

/** Live list of places plus the actions to change it. */
export function usePlaces() {
  const repository = useMemo(() => createLocalPlacesRepository(), []);
  const [places, setPlaces] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
    addPlace: repository.addPlace,
    updatePlace: repository.updatePlace,
    removePlace: repository.removePlace,
  };
}
