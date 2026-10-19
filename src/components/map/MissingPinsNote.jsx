/** Places that couldn't go on the map, as buttons to open them and add a better location. */
export function MissingPinsNote({ places, onOpenPlace }) {
  if (!places.length) return null;

  return (
    <div className="missing-pins">
      <span className="missing-pins-label">
        Sin punto en el mapa ({places.length}) · ábranlos, denle a Editar y agreguen la calle o el link de Google Maps:
      </span>
      <div className="missing-pins-list">
        {places.map((place) => (
          <button key={place.id} type="button" className="missing-pins-place" onClick={() => onOpenPlace(place.id)}>
            {place.name}
          </button>
        ))}
      </div>
    </div>
  );
}
