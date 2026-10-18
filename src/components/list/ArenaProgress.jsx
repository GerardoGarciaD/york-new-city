import { useEffect, useState } from "react";
import { ARENA_FLOORS_PER_VISIT, ARENA_GOAL_FLOOR } from "../../config/places";

/** Heavens Arena: every visited place climbs 10 floors, the goal is floor 200. */
export function ArenaProgress({ visitedCount }) {
  const currentFloor = Math.min(ARENA_GOAL_FLOOR, visitedCount * ARENA_FLOORS_PER_VISIT);
  const progressPercent = (currentFloor / ARENA_GOAL_FLOOR) * 100;
  // Start at 0 so the bar animates up when the page opens.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    const frameId = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);
  const note =
    currentFloor >= ARENA_GOAL_FLOOR
      ? "Llegaron al piso 200. ¡Felicidades, gourmet hunters!"
      : `Cada lugar visitado los sube 10 pisos. Faltan ${ARENA_GOAL_FLOOR - currentFloor} para el 200.`;

  return (
    <div className="arena" aria-live="polite">
      <div className="top">
        <span>Arena celestial · 天空闘技場</span>
        <b>Piso {currentFloor}</b>
      </div>
      <div className="bar">
        <i style={{ width: hasMounted ? `${progressPercent}%` : 0 }} />
      </div>
      <div className="top">
        <span>{note}</span>
      </div>
    </div>
  );
}
