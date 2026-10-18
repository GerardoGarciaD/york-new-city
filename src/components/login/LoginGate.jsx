import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { TravelLicense } from "./TravelLicense";

const LEAVE_ANIMATION_MS = 700;
const SHAKE_ANIMATION_MS = 400;
const FOCUS_AFTER_FLIP_MS = 500;
const TILT_HORIZONTAL_DEGREES = 16;
const TILT_VERTICAL_DEGREES = 12;

/**
 * Full-screen login with the travel license.
 * checkPassword(password, playerKey) -> Promise<boolean>, throws when offline; onAuthenticated(playerKey) runs after the exit animation.
 */
export function LoginGate({ defaultPlayer = "firstPlayer", checkPassword, onAuthenticated }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(defaultPlayer);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cardRef = useRef(null);
  const enterButtonRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    enterButtonRef.current?.focus();
  }, []);

  function flipCard(shouldShowBack) {
    setIsFlipped(shouldShowBack);
    if (shouldShowBack) setTimeout(() => passwordInputRef.current?.focus(), FOCUS_AFTER_FLIP_MS);
    else enterButtonRef.current?.focus();
  }

  function shakeCard() {
    setIsShaking(false);
    requestAnimationFrame(() => setIsShaking(true));
    setTimeout(() => setIsShaking(false), SHAKE_ANIMATION_MS);
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    if (!password.trim()) {
      setErrorMessage("Escriban la contraseña para entrar.");
      return;
    }
    let isCorrect;
    try {
      isCorrect = await checkPassword(password, selectedPlayer);
    } catch {
      setErrorMessage("No hay conexión con el servidor. Intenten de nuevo.");
      return;
    }
    if (!isCorrect) {
      setErrorMessage("Esa contraseña no coincide. Intenten de nuevo.");
      shakeCard();
      passwordInputRef.current?.select();
      return;
    }
    setIsLeaving(true);
    setTimeout(() => onAuthenticated(selectedPlayer), prefersReducedMotion ? 0 : LEAVE_ANIMATION_MS);
  }

  // The card tilts in 3D following the pointer.
  function handlePointerMove(pointerEvent) {
    if (prefersReducedMotion || isLeaving || !cardRef.current) return;
    const horizontalOffset = pointerEvent.clientX / window.innerWidth - 0.5;
    const verticalOffset = pointerEvent.clientY / window.innerHeight - 0.5;
    cardRef.current.style.transform = `rotateY(${horizontalOffset * TILT_HORIZONTAL_DEGREES}deg) rotateX(${-verticalOffset * TILT_VERTICAL_DEGREES}deg)`;
  }

  function handlePointerLeave() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  return (
    <div
      className={`gate${isLeaving ? " out" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loginTitle"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <TravelLicense
        ref={cardRef}
        passwordInputRef={passwordInputRef}
        isFlipped={isFlipped}
        isLeaving={isLeaving}
        isShaking={isShaking}
        backProps={{
          selectedPlayer,
          onSelectPlayer: setSelectedPlayer,
          password,
          onChangePassword: (nextPassword) => {
            setPassword(nextPassword);
            setErrorMessage("");
          },
          errorMessage,
          onSubmit: handleSubmit,
          onFlipBack: () => flipCard(false),
        }}
      />
      <button ref={enterButtonRef} className={`gate-enter${isFlipped ? " hide" : ""}`} type="button" onClick={() => flipCard(true)}>
        ENTRAR
      </button>
    </div>
  );
}
