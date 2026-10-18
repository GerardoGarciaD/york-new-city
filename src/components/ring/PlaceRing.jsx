import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MAX_CARDS_IN_RING } from "../../config/cards";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { ChapterHeading } from "../common/ChapterHeading";
import { CrossTitle } from "../common/CrossTitle";
import { EmptyCard, PlaceCard } from "./PlaceCard";

const NARROW_SCREEN_PX = 760;
const MIN_SLOTS_NARROW = 7;
const MIN_SLOTS_WIDE = 8;
const CARD_GAP_NARROW_PX = 34;
const CARD_GAP_WIDE_PX = 56;
const DRAG_START_THRESHOLD_PX = 6;
const DRAG_SENSITIVITY = 0.32;
const SPIN_FRICTION = 0.94;
const IDLE_SPIN_DEGREES_PER_MS = 0.006;
const SPEED_LINES_MIN_VELOCITY = 1.2;

function isNarrowScreen() {
  return window.innerWidth < NARROW_SCREEN_PX;
}

/** Spinning 3D ring of place cards. Drag to spin, tap to open. */
export function PlaceRing({ places, categoryKey, isLoaded, onOpenPlace, onAddPlace }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isNarrow, setIsNarrow] = useState(isNarrowScreen);
  const [isDragging, setIsDragging] = useState(false);

  const ringRef = useRef(null);
  const stageRef = useRef(null);
  const speedLinesRef = useRef(null);
  const cardElementsRef = useRef([]);
  const motionRef = useRef({
    angleDegrees: 0,
    velocity: 0,
    radius: 300,
    isPointerDown: false,
    hasDragged: false,
    isHovering: false,
    lastPointerX: 0,
    pointerDownX: 0,
  });

  const visiblePlaces = places.slice(0, MAX_CARDS_IN_RING);
  const slotCount = Math.max(visiblePlaces.length + 1, isNarrow ? MIN_SLOTS_NARROW : MIN_SLOTS_WIDE);
  const emptySlotCount = slotCount - visiblePlaces.length;
  const contentSignature = `${categoryKey}|${isLoaded}|${visiblePlaces.map((place) => `${place.id}:${place.status}:${place.rating}`).join(",")}`;

  /** Places every card around the ring and shades the ones turned away from us. */
  function paintRing() {
    const motion = motionRef.current;
    const ringElement = ringRef.current;
    if (!ringElement) return;
    ringElement.style.transform = `translateZ(${-motion.radius}px) rotateY(${motion.angleDegrees}deg)`;
    cardElementsRef.current.forEach((cardElement, slotIndex) => {
      if (!cardElement) return;
      const slotAngle = (slotIndex * 360) / slotCount;
      const facingAmount = Math.cos(((slotAngle + motion.angleDegrees) * Math.PI) / 180);
      cardElement.style.transform = `rotateY(${slotAngle}deg) translateZ(${motion.radius}px)`;
      cardElement.style.setProperty("--dim", (0.55 * (1 - Math.max(0, facingAmount))).toFixed(3));
      cardElement.style.opacity = facingAmount < -0.15 ? "0" : "1";
      cardElement.style.pointerEvents = facingAmount < 0.35 ? "none" : "auto";
      cardElement.style.zIndex = String(Math.round((facingAmount + 1) * 100));
      const isFrontCard = facingAmount > 0.93 && !cardElement.classList.contains("ghost");
      cardElement.classList.toggle("aura", isFrontCard);
    });
  }

  // Track narrow vs wide screens (only width changes matter, not mobile address-bar height changes).
  useEffect(() => {
    let resizeTimer = 0;
    let lastWidth = window.innerWidth;
    function handleResize() {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setIsNarrow(isNarrowScreen()), 200);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Compute the ring radius from the card width so cards never overlap.
  useLayoutEffect(() => {
    const cardWidth = ringRef.current.offsetWidth || 220;
    const cardGap = isNarrow ? CARD_GAP_NARROW_PX : CARD_GAP_WIDE_PX;
    motionRef.current.radius = Math.round((cardWidth / 2 + cardGap) / Math.tan(Math.PI / slotCount));
    paintRing();
  });

  // Entrance animation when the category or the places change (cards fade in one by one).
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    ringRef.current.animate([{ translate: "0 30px" }, { translate: "0 0" }], { duration: 650, easing: "cubic-bezier(.2,.9,.15,1)" });
    cardElementsRef.current.forEach((cardElement, slotIndex) => {
      cardElement?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: slotIndex * 40, easing: "ease-out", fill: "backwards" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentSignature]);

  // Animation loop: inertia after a drag, slow idle spin otherwise.
  useEffect(() => {
    let animationFrameId = 0;
    let lastTimeMs = 0;
    function animate(timeMs) {
      const elapsedMs = Math.min(48, timeMs - (lastTimeMs || timeMs));
      lastTimeMs = timeMs;
      const motion = motionRef.current;
      if (!motion.isPointerDown) {
        speedLinesRef.current?.classList.toggle("go", Math.abs(motion.velocity) > SPEED_LINES_MIN_VELOCITY);
        if (Math.abs(motion.velocity) > 0.01) {
          motion.angleDegrees += motion.velocity;
          motion.velocity *= SPIN_FRICTION;
        } else if (!motion.isHovering && !prefersReducedMotion) {
          motion.angleDegrees -= IDLE_SPIN_DEGREES_PER_MS * elapsedMs;
        }
        paintRing();
      }
      animationFrameId = requestAnimationFrame(animate);
    }
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, slotCount]);

  // Dragging works anywhere on the page once started on the stage.
  useEffect(() => {
    function handlePointerMove(pointerEvent) {
      const motion = motionRef.current;
      if (!motion.isPointerDown) return;
      const deltaX = pointerEvent.clientX - motion.lastPointerX;
      motion.lastPointerX = pointerEvent.clientX;
      if (!motion.hasDragged && Math.abs(pointerEvent.clientX - motion.pointerDownX) > DRAG_START_THRESHOLD_PX) {
        motion.hasDragged = true;
        setIsDragging(true);
        try {
          stageRef.current.setPointerCapture(pointerEvent.pointerId);
        } catch {
          // Pointer capture is optional.
        }
      }
      if (motion.hasDragged) {
        motion.angleDegrees += deltaX * DRAG_SENSITIVITY;
        motion.velocity = deltaX * DRAG_SENSITIVITY;
        paintRing();
      }
    }
    function handlePointerUp() {
      const motion = motionRef.current;
      if (!motion.isPointerDown) return;
      motion.isPointerDown = false;
      setIsDragging(false);
      // Let the click event see that this was a drag, then reset.
      setTimeout(() => {
        motion.hasDragged = false;
      }, 0);
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotCount]);

  function handleStagePointerDown(pointerEvent) {
    const motion = motionRef.current;
    motion.isPointerDown = true;
    motion.hasDragged = false;
    motion.lastPointerX = pointerEvent.clientX;
    motion.pointerDownX = pointerEvent.clientX;
    motion.velocity = 0;
  }

  /** Ignore the click that ends a drag. */
  function onlyIfNotDragged(action) {
    return () => {
      if (!motionRef.current.hasDragged) action();
    };
  }

  const ringNote =
    places.length > MAX_CARDS_IN_RING
      ? `Mostrando ${MAX_CARDS_IN_RING} · el resto está en la lista de abajo`
      : "Book · arrastra para girar · toca una tarjeta";

  cardElementsRef.current = [];

  return (
    <section className="ring-sec" aria-label="Lugares">
      <div className="speed" ref={speedLinesRef} aria-hidden="true" />
      <div
        className={`stage${isDragging ? " drag" : ""}`}
        ref={stageRef}
        onPointerDown={handleStagePointerDown}
        onPointerEnter={(pointerEvent) => {
          if (pointerEvent.pointerType === "mouse") motionRef.current.isHovering = true;
        }}
        onPointerLeave={() => {
          motionRef.current.isHovering = false;
        }}
      >
        <div className="ring" ref={ringRef}>
          {visiblePlaces.map((place, placeIndex) => (
            <PlaceCard
              key={place.id}
              ref={(cardElement) => {
                cardElementsRef.current[placeIndex] = cardElement;
              }}
              place={place}
              onOpen={onlyIfNotDragged(() => onOpenPlace(place.id))}
            />
          ))}
          {[...Array(emptySlotCount).keys()].map((emptyIndex) => (
            <EmptyCard
              key={`empty-${emptyIndex}`}
              ref={(cardElement) => {
                cardElementsRef.current[visiblePlaces.length + emptyIndex] = cardElement;
              }}
              isLoaded={isLoaded}
              hasPlaces={visiblePlaces.length > 0}
              onAdd={onlyIfNotDragged(onAddPlace)}
            />
          ))}
        </div>
      </div>
      <ChapterHeading number="02" nenKanji="練" style={{ justifyContent: "center", marginBottom: 4 }}>
        <span>
          <CrossTitle words={["Lote", "Por", "Lote"]} />
        </span>
      </ChapterHeading>
      <div className="ring-note">{ringNote}</div>
    </section>
  );
}
