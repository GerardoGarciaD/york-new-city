import { forwardRef } from "react";
import { getPersonName } from "../../config/people";
import { formatLotNumber } from "../../utils/format";
import { SealedCardFace } from "./SealedCardFace";

/** Someone else's secret in the 3D ring: Zetsu, almost no presence until it's revealed. */
export const SealedPlaceCard = forwardRef(function SealedPlaceCard({ place, onOpen }, cardRef) {
  return (
    <button
      ref={cardRef}
      type="button"
      className="card sealed"
      aria-label={`Lote ${formatLotNumber(place.lot)} sellado de ${getPersonName(place.secretOwner)}`}
      onClick={onOpen}
    >
      <SealedCardFace place={place} />
    </button>
  );
});
