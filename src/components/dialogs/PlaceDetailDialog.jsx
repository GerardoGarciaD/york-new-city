import { useEffect, useState } from "react";
import { RANKS } from "../../config/cards";
import { categoryColorStyle, findCategory } from "../../config/categories";
import { getPersonName } from "../../config/people";
import { PLACE_STATUS, STATUS_LABELS } from "../../config/places";
import { formatLotNumber, formatPrice } from "../../utils/format";
import { Modal } from "../common/Modal";
import { SecretMark } from "../secret/SecretMark";
import { PlaceMap } from "./PlaceMap";

const MAX_RATING = 5;
const LINK_PREVIEW_LENGTH = 48;
const STAR_VALUES = [1, 2, 3, 4, 5];

/** Full view of a place: details, rating, mark as visited, edit and delete. Your own secrets also get "Revelar". */
export function PlaceDetailDialog({ place, onClose, onRate, onToggleVisited, onEdit, onDelete, onReveal }) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isOpen = Boolean(place);

  useEffect(() => {
    setIsConfirmingDelete(false);
  }, [place?.id]);

  if (!place) return <Modal isOpen={false} onClose={onClose} labelledBy="placeDetailTitle" />;

  const category = findCategory(place.category);
  const currentRating = place.rating || 0;
  const detailRows = [
    ["Lote", formatLotNumber(place.lot)],
    ...(place.location ? [["Ubicación", place.location]] : []),
    ["Precio", formatPrice(place.price)],
    ["Estado", STATUS_LABELS[place.status]],
  ];
  if (place.proposedBy) detailRows.push(["Lo propuso", getPersonName(place.proposedBy)]);
  if (place.notes) detailRows.push(["Notas", place.notes]);

  function handleDeleteClick() {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    onDelete(place);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="placeDetailTitle">
      <div className="detail-hero" style={categoryColorStyle(category)}>
        <span className="big">{category.kanji}</span>
        <span className="eyebrow" style={{ color: "inherit", opacity: 0.8 }}>
          {category.name}
          {place.isExample && " · ejemplo"}
        </span>
        <h3 id="placeDetailTitle">{place.name}</h3>
        {place.isSecret && <SecretMark />}
      </div>
      <div className="dlg">
        <dl className="kv">
          {detailRows.map(([label, value]) => (
            <div key={label} style={{ display: "contents" }}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          {place.url && (
            <>
              <dt>Link</dt>
              <dd>
                <a href={place.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                  {place.url.replace(/^https?:\/\//, "").slice(0, LINK_PREVIEW_LENGTH)}
                </a>
              </dd>
            </>
          )}
        </dl>

        {(place.location || place.mapsLink) && <PlaceMap place={place} />}

        <div className="field">
          <span className="flabel">
            ¿Qué tal estuvo? · <span className="jp">おいしかった？</span>{" "}
            <span className="rank" style={{ marginLeft: 6 }}>
              {currentRating ? `Rango ${RANKS[currentRating]}` : "Sin rango"}
            </span>
          </span>
          <div className="stars">
            {STAR_VALUES.map((starValue) => (
              <button
                key={starValue}
                type="button"
                className={starValue <= currentRating ? "on" : ""}
                aria-label={`${starValue} de ${MAX_RATING}`}
                onClick={() => onRate(place, currentRating === starValue ? 0 : starValue)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn ghost danger" onClick={handleDeleteClick}>
            {isConfirmingDelete ? "Toca otra vez para borrar" : "Borrar"}
          </button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {place.isSecret && (
              <button type="button" className="btn reveal" onClick={() => onReveal(place)}>
                Revelar · 秘
              </button>
            )}
            <button type="button" className="btn ghost" onClick={() => onEdit(place)}>
              Editar
            </button>
            <button type="button" className="btn" onClick={() => onToggleVisited(place)}>
              {place.status === PLACE_STATUS.visited ? "Regresar a pendientes" : "Visitados"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
