import { useEffect, useState } from "react";
import { findCategory } from "../../config/categories";
import { MOON_PHASES, TIMES_OF_NIGHT } from "../../config/fortune";
import { pickRandom } from "../../utils/random";
import { CrossTitle } from "../common/CrossTitle";
import { Modal } from "../common/Modal";

const SILENT_STARS_TEXT = "Las estrellas guardan silencio.\nNo hay lugares pendientes.\nAgreguen uno a la lista\ny vuelvan a preguntar.";

function writeProphecy(place) {
  const category = findCategory(place.category);
  return (
    `${pickRandom(TIMES_OF_NIGHT)} bajo ${pickRandom(MOON_PHASES)},\n` +
    `dos viajeros cruzarán ${place.neighborhood || place.borough}.\n` +
    `Los espera algo de ${category.name.toLowerCase()} (${category.japaneseName}),\n` +
    `y su nombre es ${place.name}.`
  );
}

/**
 * Picks a random pending place, preferring the current category, and announces it as a short poem.
 * candidatePlaces: pending places in the selected category. fallbackPlaces: all pending places.
 */
export function ProphecyDialog({ isOpen, candidatePlaces, fallbackPlaces, onClose, onOpenPlace }) {
  const [chosenPlace, setChosenPlace] = useState(null);
  const [prophecyText, setProphecyText] = useState("");

  function tellProphecy() {
    const possiblePlaces = candidatePlaces.length ? candidatePlaces : fallbackPlaces;
    if (!possiblePlaces.length) {
      setChosenPlace(null);
      setProphecyText(SILENT_STARS_TEXT);
      return;
    }
    let nextPlace = pickRandom(possiblePlaces);
    // Avoid repeating the same place twice in a row when there are other options.
    if (possiblePlaces.length > 1 && chosenPlace && nextPlace.id === chosenPlace.id) {
      nextPlace = possiblePlaces.find((place) => place.id !== chosenPlace.id);
    }
    setChosenPlace(nextPlace);
    setProphecyText(writeProphecy(nextPlace));
  }

  useEffect(() => {
    if (isOpen) tellProphecy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="prophecyTitle">
      <div className="dlg">
        <span className="eyebrow jp" style={{ color: "var(--crimson)" }}>
          今夜の予言 · profecía de esta noche
        </span>
        <h3 id="prophecyTitle">
          <CrossTitle words={["Profecía", "De", "La cena"]} />
        </h3>
        <p className="prophecy">{prophecyText}</p>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={tellProphecy}>
            Otra profecía
          </button>
          <button type="button" className="btn" hidden={!chosenPlace} onClick={() => onOpenPlace(chosenPlace.id)}>
            Ver el lugar
          </button>
        </div>
      </div>
    </Modal>
  );
}
