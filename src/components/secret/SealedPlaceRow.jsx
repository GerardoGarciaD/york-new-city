import { getPersonName } from "../../config/people";
import { formatLotNumber } from "../../utils/format";
import { SecretGlyphs } from "./SecretGlyphs";

/** Someone else's secret in the list below the ring. */
export function SealedPlaceRow({ place, onOpen }) {
  const ownerName = getPersonName(place.secretOwner);

  function handleKeyDown(keyboardEvent) {
    if (keyboardEvent.key === "Enter") onOpen();
  }

  return (
    <li className="sealed-row" tabIndex={0} onClick={onOpen} onKeyDown={handleKeyDown} aria-label={`Lote ${formatLotNumber(place.lot)} sellado de ${ownerName}`}>
      <span className="bullet">秘</span>
      <span className="nm">
        <SecretGlyphs seed={place.id} />
        <span className="sub">
          Lote sellado de {ownerName} · {formatLotNumber(place.lot)}
        </span>
      </span>
      <span className="pill st">Sellado</span>
      <span className="pr">¿?</span>
    </li>
  );
}
