import { getPersonName } from "../../config/people";
import { formatLotNumber } from "../../utils/format";
import { SecretGlyphs } from "./SecretGlyphs";
import { WaxSeal } from "./WaxSeal";

const TAPE_TEXT = "Sellado · 秘密 · No abrir hasta estar juntos · ";
const TAPE_REPEATS = 4;

/**
 * Inside of a sealed lot card: wax seal, tape and a fake name. Shows only the lot number and its owner.
 * isBreaking draws the seal as two halves, for the reveal animation.
 */
export function SealedCardFace({ place, isBreaking = false }) {
  return (
    <>
      <div className="top">
        <span className="bullet">秘</span>
        <span className="pill">Sellado</span>
      </div>
      <span className="lot">Lote {formatLotNumber(place.lot)} · 秘密</span>
      <span className="sealed-tape" aria-hidden="true">
        <span>{TAPE_TEXT.repeat(TAPE_REPEATS)}</span>
      </span>
      {isBreaking ? (
        <>
          <WaxSeal half="left" />
          <WaxSeal half="right" />
        </>
      ) : (
        <WaxSeal />
      )}
      <SecretGlyphs seed={place.id} className="sealed-name" />
      <div className="meta">
        <span>Lote sellado de {getPersonName(place.secretOwner)}</span>
      </div>
    </>
  );
}
