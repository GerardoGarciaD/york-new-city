import { useEffect } from "react";
import { PlaceCard } from "../ring/PlaceCard";
import { SealedCardFace } from "./SealedCardFace";

/** Matches the last keyframe in secret-place.css (overlay fade-out). */
const REVEAL_TOTAL_MS = 1700;

/**
 * Full-screen reveal: the seal cracks, ドン, the card shakes and turns over to show the real place.
 * Only mounted when motion is allowed; onDone runs when it ends or when tapped.
 */
export function RevealAnimation({ place, onDone }) {
  useEffect(() => {
    const doneTimer = setTimeout(onDone, REVEAL_TOTAL_MS);
    return () => clearTimeout(doneTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="reveal-overlay" role="status" aria-label={`Lote revelado: ${place.name}`} onClick={onDone}>
      <div className="reveal-stage">
        <div className="reveal-flipper">
          <div className="reveal-face">
            <div className="card sealed">
              <SealedCardFace place={place} isBreaking />
            </div>
          </div>
          <div className="reveal-face reveal-face-back">
            <PlaceCard place={place} onOpen={onDone} />
          </div>
        </div>
      </div>
      <span className="reveal-don" aria-hidden="true">
        ドン
      </span>
    </div>
  );
}
