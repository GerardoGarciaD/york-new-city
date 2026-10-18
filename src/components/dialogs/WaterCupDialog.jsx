import { useEffect, useRef, useState } from "react";
import { findCategory } from "../../config/categories";
import { NEN_TYPES } from "../../config/fortune";
import { PEOPLE, PLAYER_KEYS } from "../../config/people";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { pickRandom } from "../../utils/random";
import { ChipGroup } from "../common/ChipGroup";
import { CrossTitle } from "../common/CrossTitle";
import { Modal } from "../common/Modal";

const CONCENTRATION_MS = 1300;
const PLAYER_OPTIONS = PLAYER_KEYS.map((playerKey) => ({ value: playerKey, label: PEOPLE[playerKey] }));

/** How the water and the leaf react for each Nen type. */
const CUP_REACTIONS = {
  enhancer: { water: { height: "92%" }, leaf: { top: "6%" } },
  transmuter: { water: { background: "#f7c6d9" } },
  emitter: { water: { background: "var(--pop)" } },
  conjurer: { waterClass: "dirty" },
  manipulator: { leafClass: "spin" },
  specialist: { water: { background: "var(--crimson)", height: "40%" }, leafClass: "spin" },
};

const INTRO_TEXT = "Pongan las manos alrededor de la copa y concéntrense en lo que se les antoja.";

/** Wing's water divination: tells each player their Nen type and ideal craving. */
export function WaterCupDialog({ isOpen, defaultPlayer, onClose, onShowCategory }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedPlayer, setSelectedPlayer] = useState(defaultPlayer || "firstPlayer");
  const [phase, setPhase] = useState("idle"); // idle | concentrating | revealed
  const [nenResult, setNenResult] = useState(null);
  const [testNumber, setTestNumber] = useState(0);
  const revealTimerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(revealTimerRef.current);
    setSelectedPlayer(defaultPlayer || "firstPlayer");
    setPhase("idle");
    setNenResult(null);
  }, [isOpen, defaultPlayer]);

  useEffect(() => () => clearTimeout(revealTimerRef.current), []);

  function runTest() {
    clearTimeout(revealTimerRef.current);
    setNenResult(pickRandom(NEN_TYPES));
    setPhase("concentrating");
    setTestNumber((previousNumber) => previousNumber + 1);
    revealTimerRef.current = setTimeout(() => setPhase("revealed"), prefersReducedMotion ? 0 : CONCENTRATION_MS);
  }

  const reaction = phase === "revealed" && nenResult ? CUP_REACTIONS[nenResult.key] : {};
  const idealCategory = nenResult ? findCategory(nenResult.categoryKey) : null;
  const playerName = PEOPLE[selectedPlayer];

  let resultContent = (
    <p className="lema" style={{ textAlign: "left", margin: 0 }}>
      {INTRO_TEXT}
    </p>
  );
  if (phase === "concentrating") {
    resultContent = (
      <p className="lema" style={{ textAlign: "left", margin: 0 }}>
        Concentrando el aura de {playerName}…
      </p>
    );
  }
  if (phase === "revealed" && nenResult) {
    resultContent = (
      <>
        <span className="eyebrow jp" style={{ color: "var(--crimson)" }}>
          {nenResult.japaneseName}
        </span>
        <h4>
          {playerName}: {nenResult.name}
        </h4>
        <p>{nenResult.effect}</p>
        <p className="lema" style={{ textAlign: "left", marginTop: 6 }}>
          {nenResult.description} Su antojo ideal: {idealCategory.name.toLowerCase()} ({idealCategory.kanji}).
        </p>
      </>
    );
  }

  const isGlowing = phase !== "idle" && !prefersReducedMotion;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="waterCupTitle">
      <div className="dlg">
        <span className="eyebrow jp" style={{ color: "var(--crimson)" }}>
          水見式 · adivinación con agua
        </span>
        <h3 id="waterCupTitle">
          <CrossTitle words={["Copa", "De", "Antojo"]} />
        </h3>
        <ChipGroup ariaLabel="¿Quién hace la prueba?" options={PLAYER_OPTIONS} selectedValue={selectedPlayer} onSelect={setSelectedPlayer} />
        <div className="cup-wrap">
          <div key={testNumber} className={`cup${isGlowing ? " glow" : ""}`}>
            <div className={`water${reaction.waterClass ? ` ${reaction.waterClass}` : ""}`} style={reaction.water} />
            <div className={`leaf${reaction.leafClass ? ` ${reaction.leafClass}` : ""}`} style={reaction.leaf} />
          </div>
        </div>
        <div className="cup-res" aria-live="polite">
          {resultContent}
        </div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cerrar
          </button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn ghost" hidden={phase !== "revealed"} onClick={() => onShowCategory(nenResult.categoryKey)}>
              Ver esos lugares
            </button>
            <button type="button" className="btn" onClick={runTest}>
              {phase === "idle" ? "Hacer la prueba" : "Otra vez"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
