import { forwardRef } from "react";
import { CARD_SUITS, GEM_RANK_MIN_RATING, RANKS } from "../../config/cards";
import { categoryColorStyle, findCategory, findCategoryIndex } from "../../config/categories";
import { getPersonName } from "../../config/people";
import { PLACE_STATUS, STATUS_LABELS } from "../../config/places";
import { formatLotNumber, formatPrice } from "../../utils/format";

/** One "lot" card in the 3D ring. */
export const PlaceCard = forwardRef(function PlaceCard({ place, onOpen }, cardRef) {
  const category = findCategory(place.category);
  const isVisited = place.status === PLACE_STATUS.visited;
  const suit = CARD_SUITS[findCategoryIndex(category.key) % CARD_SUITS.length];
  const proposerName = place.proposedBy ? getPersonName(place.proposedBy) : "";

  return (
    <button
      ref={cardRef}
      type="button"
      className="card"
      style={categoryColorStyle(category)}
      aria-label={`${place.name}, ${place.neighborhood || place.borough}`}
      onClick={onOpen}
    >
      <div className="top">
        <span className="bullet">{category.kanji}</span>
        <span className={`pill${isVisited ? " fui" : ""}`}>{STATUS_LABELS[place.status]}</span>
      </div>
      {isVisited && (
        <span className="hanko" aria-hidden="true">
          行った
          <br />済
        </span>
      )}
      <span className="jcat">{category.japaneseName}</span>
      <span className="lot">
        Lote {formatLotNumber(place.lot)}
        {proposerName && ` · ${proposerName}`}
      </span>
      <span className="big" aria-hidden="true">
        {category.kanji}
      </span>
      <span className="suit" aria-hidden="true">
        {suit}
      </span>
      <span className="suit flip" aria-hidden="true">
        {suit}
      </span>
      <h3>{place.name}</h3>
      <div className="meta">
        <span>
          {place.neighborhood || place.borough}
          <br />
          {place.borough}
        </span>
        <span style={{ display: "grid", justifyItems: "end", gap: 4 }}>
          {place.rating > 0 && (
            <span className={`rank${place.rating >= GEM_RANK_MIN_RATING ? " gem" : ""}`} title="Rango">
              {RANKS[place.rating]}
            </span>
          )}
          {formatPrice(place.price)}
        </span>
      </div>
    </button>
  );
});

/** Empty slot that invites adding a place. */
export const EmptyCard = forwardRef(function EmptyCard({ isLoaded, hasPlaces, onAdd }, cardRef) {
  let label = (
    <>
      ¿Qué se nos
      <br />
      antoja?
    </>
  );
  if (!isLoaded) label = "Cargando";
  else if (hasPlaces)
    label = (
      <>
        Agregar
        <br />a la lista
      </>
    );

  return (
    <button ref={cardRef} type="button" className="card ghost" onClick={onAdd}>
      <span className="plus">+</span>
      <span className="gl">{label}</span>
    </button>
  );
});
