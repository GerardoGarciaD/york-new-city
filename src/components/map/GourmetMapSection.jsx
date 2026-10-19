import { useState } from "react";
import { STATUS_FILTERS } from "../../config/places";
import { getMapPoint } from "../../utils/maps";
import { ChapterHeading } from "../common/ChapterHeading";
import { CrossTitle } from "../common/CrossTitle";
import { GourmetMap } from "./GourmetMap";
import { MissingPinsNote } from "./MissingPinsNote";

/**
 * Cap. 04 · Gourmet Map: every shared place on one map, pending and visited.
 * places: only shared places (no unrevealed secrets), so the map never gives a surprise away.
 */
export function GourmetMapSection({ places, isLoaded, onOpenPlace }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredPlaces = places.filter((place) => statusFilter === "all" || place.status === statusFilter);
  const placesWithoutPoint = filteredPlaces.filter((place) => !getMapPoint(place));
  const pinCount = filteredPlaces.length - placesWithoutPoint.length;

  return (
    <section className="wrap map-sec">
      <ChapterHeading number="04" nenKanji="凝">
        <span className="jp" style={{ fontSize: ".8em", color: "var(--muted)" }}>
          グルメ地図
        </span>
      </ChapterHeading>
      <div className="list-head">
        <h2>
          <span className="tag">地図</span>
          <CrossTitle words={["Gourmet", "Map"]} />
        </h2>
        <div className="seg" role="group" aria-label="Filtrar el mapa por estado">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={statusFilter === filter.value ? "true" : "false"}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <p className="map-note">{isLoaded ? `${pinCount} ${pinCount === 1 ? "lugar" : "lugares"} en el mapa · toquen un pin para verlo` : "Cargando el mapa…"}</p>
      <GourmetMap places={filteredPlaces} onOpenPlace={onOpenPlace} />
      <MissingPinsNote places={placesWithoutPoint} onOpenPlace={onOpenPlace} />
    </section>
  );
}
