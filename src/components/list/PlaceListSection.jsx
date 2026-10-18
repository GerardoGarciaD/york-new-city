import { PLACE_STATUS, STATUS_FILTERS } from "../../config/places";
import { ChapterHeading } from "../common/ChapterHeading";
import { CrossTitle } from "../common/CrossTitle";
import { ArenaProgress } from "./ArenaProgress";
import { PlaceRow } from "./PlaceRow";

/** Pending places first, then alphabetical. */
function sortPlaces(firstPlace, secondPlace) {
  if (firstPlace.status !== secondPlace.status) return firstPlace.status === PLACE_STATUS.pending ? -1 : 1;
  return String(firstPlace.name).localeCompare(secondPlace.name);
}

const EMPTY_ROW_STYLE = { display: "block", cursor: "default" };

export function PlaceListSection({ places, isLoaded, statusFilter, onChangeStatusFilter, onOpenPlace }) {
  const visitedCount = places.filter((place) => place.status === PLACE_STATUS.visited).length;
  const filteredPlaces = places.filter((place) => statusFilter === "all" || place.status === statusFilter).sort(sortPlaces);

  let listContent;
  if (!isLoaded) {
    listContent = (
      <li className="empty" style={EMPTY_ROW_STYLE}>
        Cargando la lista…
      </li>
    );
  } else if (filteredPlaces.length === 0) {
    listContent = (
      <li className="empty" style={EMPTY_ROW_STYLE}>
        {places.length ? "Nada con este filtro." : "Todavía no hay nada. ¿Qué se nos antoja? Usen “+ Agregar a la lista”."}
      </li>
    );
  } else {
    listContent = filteredPlaces.map((place) => <PlaceRow key={place.id} place={place} onOpen={() => onOpenPlace(place.id)} />);
  }

  return (
    <section className="wrap list-sec">
      <ChapterHeading number="03" nenKanji="発">
        <span className="jp" style={{ fontSize: ".8em", color: "var(--muted)" }}>
          ぜんぶのお店
        </span>
      </ChapterHeading>
      <div className="list-head">
        <h2>
          <span className="tag">任務</span>
          <CrossTitle words={["Misión", "En", "York New"]} />
        </h2>
        <div className="seg" role="group" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={statusFilter === filter.value ? "true" : "false"}
              onClick={() => onChangeStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <ArenaProgress visitedCount={visitedCount} />
      <ul className="rows">{listContent}</ul>
    </section>
  );
}
