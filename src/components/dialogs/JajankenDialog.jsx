import { useEffect, useRef, useState } from "react";
import { HANDS } from "../../config/fortune";
import { PEOPLE } from "../../config/people";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { pickRandom } from "../../utils/random";
import { CrossTitle } from "../common/CrossTitle";
import { Modal } from "../common/Modal";

const SHAKE_DURATION_MS = 1500;
const ROCK_JAPANESE = "グー";

/** Two different random hands, so there is always a winner. */
function throwTwoDifferentHands() {
  const firstHand = pickRandom(HANDS);
  const secondHand = pickRandom(HANDS.filter((hand) => hand.key !== firstHand.key));
  return [firstHand, secondHand];
}

/** Gon's Jajanken: rock, paper, scissors to decide who picks today. */
export function JajankenDialog({ isOpen, onClose }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [hands, setHands] = useState(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const revealTimerRef = useRef(null);

  function playRound() {
    clearTimeout(revealTimerRef.current);
    setHands(null);
    setRoundNumber((previousRound) => previousRound + 1);
    revealTimerRef.current = setTimeout(() => setHands(throwTwoDifferentHands()), prefersReducedMotion ? 0 : SHAKE_DURATION_MS);
  }

  useEffect(() => {
    if (isOpen) playRound();
    return () => clearTimeout(revealTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const [firstHand, secondHand] = hands || [];
  const firstPlayerWins = hands ? firstHand.beats === secondHand.key : false;
  const isShaking = !hands && !prefersReducedMotion;

  let resultText = "じゃん… けん…";
  if (hands) {
    const winnerName = firstPlayerWins ? PEOPLE.firstPlayer : PEOPLE.secondPlayer;
    resultText = `${firstHand.name} contra ${secondHand.name}: hoy elige ${winnerName}`;
  }

  function handClassName(isWinner) {
    let className = "hand";
    if (isShaking) className += " shake";
    if (hands && isWinner) className += " win";
    return className;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="jajankenTitle">
      <div className="dlg">
        <span className="eyebrow jp" style={{ color: "var(--crimson)" }}>
          最初はグー · primero piedra
        </span>
        <h3 id="jajankenTitle">
          <CrossTitle words={["Piedra", "Papel", "Tijera"]} />
        </h3>
        <div className="jjk">
          <div>
            <span key={`first-${roundNumber}`} className={handClassName(firstPlayerWins)}>
              {firstHand ? firstHand.japaneseName : ROCK_JAPANESE}
            </span>
            <small>{PEOPLE.firstPlayer}</small>
          </div>
          <span className="vs">VS</span>
          <div>
            <span key={`second-${roundNumber}`} className={handClassName(!firstPlayerWins)}>
              {secondHand ? secondHand.japaneseName : ROCK_JAPANESE}
            </span>
            <small>{PEOPLE.secondPlayer}</small>
          </div>
        </div>
        <p className="jres" aria-live="polite">
          {resultText}
        </p>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn" onClick={playRound}>
            Otra vez
          </button>
        </div>
      </div>
    </Modal>
  );
}
