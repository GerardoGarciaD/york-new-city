import { buildMapEmbedUrl, buildOpenInMapsUrl } from "../../utils/maps";

/** Small Google map with the place's pin, plus a button to open it in the phone's maps app. */
export function PlaceMap({ place }) {
  const hasMap = Boolean(place.location || place.coordinates);

  return (
    <div className="place-map">
      {hasMap && (
        <iframe
          className="place-map-frame"
          title={`Mapa de ${place.name}`}
          src={buildMapEmbedUrl(place)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <a className="btn ghost place-map-open" href={buildOpenInMapsUrl(place)} target="_blank" rel="noopener noreferrer">
        Abrir en Maps
      </a>
    </div>
  );
}
