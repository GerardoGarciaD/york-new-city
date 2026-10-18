import { useEffect, useRef, useState } from "react";
import { CATEGORIES, categoryColorStyle } from "../../config/categories";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { CategoryBullet } from "../common/CategoryBullet";
import { ChapterHeading } from "../common/ChapterHeading";
import { CrossTitle } from "../common/CrossTitle";
import { ElectricZap } from "./ElectricZap";

const CATEGORY_COUNT = CATEGORIES.length;
const DEGREES_PER_CATEGORY = 360 / CATEGORY_COUNT;
const DRAG_THRESHOLD_DEGREES = 1.5;
const WHEEL_COOLDOWN_MS = 220;
const SPEED_LINES_FADE_MS = 250;

/** Which category sits under the pointer for a given dial rotation. */
function getIndexFromRotation(rotationDegrees) {
  const steps = Math.round(-rotationDegrees / DEGREES_PER_CATEGORY);
  return ((steps % CATEGORY_COUNT) + CATEGORY_COUNT) % CATEGORY_COUNT;
}

function getPointerAngle(pointerEvent, centerPoint) {
  return (Math.atan2(pointerEvent.clientY - centerPoint.y, pointerEvent.clientX - centerPoint.x) * 180) / Math.PI;
}

function normalizeAngleDifference(angleDifference) {
  if (angleDifference > 180) return angleDifference - 360;
  if (angleDifference < -180) return angleDifference + 360;
  return angleDifference;
}

export function CategoryDial({ selectedIndex, onSelectIndex, placesInCategoryCount, isLoaded, onOpenProphecy, onOpenJajanken, onOpenWaterCup }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [showSpeedLines, setShowSpeedLines] = useState(false);
  const [zapReplayKey, setZapReplayKey] = useState(0);

  const rotationRef = useRef(0);
  const dialViewRef = useRef(null);
  const dialRef = useRef(null);
  const dragStateRef = useRef({ isDragging: false, hasMoved: false, startAngle: 0, startRotation: 0 });
  const lastWheelTimeRef = useRef(0);
  const previousSelectedIndexRef = useRef(selectedIndex);

  const selectedCategory = CATEGORIES[selectedIndex];

  function applyRotation(nextRotation, shouldSnap) {
    rotationRef.current = nextRotation;
    setIsSnapping(shouldSnap);
    setRotationDegrees(nextRotation);
  }

  // Rotate the dial when the selected category changes from outside (buttons, keyboard, other dialogs).
  useEffect(() => {
    if (dragStateRef.current.isDragging) return;
    const currentRotation = rotationRef.current;
    const currentIndex = getIndexFromRotation(currentRotation);
    if (currentIndex === selectedIndex) return;
    // Take the shortest way around the dial.
    let stepDifference = selectedIndex - currentIndex;
    if (stepDifference > CATEGORY_COUNT / 2) stepDifference -= CATEGORY_COUNT;
    if (stepDifference < -CATEGORY_COUNT / 2) stepDifference += CATEGORY_COUNT;
    const alignedRotation = Math.round(currentRotation / DEGREES_PER_CATEGORY) * DEGREES_PER_CATEGORY;
    applyRotation(alignedRotation - stepDifference * DEGREES_PER_CATEGORY, true);
  }, [selectedIndex]);

  // Electric spark every time the category changes (after the list has loaded).
  useEffect(() => {
    if (previousSelectedIndexRef.current !== selectedIndex && isLoaded && !prefersReducedMotion) {
      setZapReplayKey((replayKey) => replayKey + 1);
    }
    previousSelectedIndexRef.current = selectedIndex;
  }, [selectedIndex, isLoaded, prefersReducedMotion]);

  // Mouse wheel turns the dial one step. Needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const dialView = dialViewRef.current;
    function handleWheel(wheelEvent) {
      wheelEvent.preventDefault();
      const now = Date.now();
      if (now - lastWheelTimeRef.current < WHEEL_COOLDOWN_MS) return;
      lastWheelTimeRef.current = now;
      const direction = wheelEvent.deltaY + wheelEvent.deltaX > 0 ? 1 : -1;
      onSelectIndex((selectedIndex + direction + CATEGORY_COUNT) % CATEGORY_COUNT);
    }
    dialView.addEventListener("wheel", handleWheel, { passive: false });
    return () => dialView.removeEventListener("wheel", handleWheel);
  }, [selectedIndex, onSelectIndex]);

  function selectNext(direction) {
    onSelectIndex((selectedIndex + direction + CATEGORY_COUNT) % CATEGORY_COUNT);
  }

  function getDialCenter() {
    const bounds = dialRef.current.getBoundingClientRect();
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  }

  function handlePointerDown(pointerEvent) {
    dragStateRef.current = {
      isDragging: true,
      hasMoved: false,
      startAngle: getPointerAngle(pointerEvent, getDialCenter()),
      startRotation: rotationRef.current,
    };
    dialViewRef.current.setPointerCapture(pointerEvent.pointerId);
    setIsSnapping(false);
    setShowSpeedLines(true);
  }

  function handlePointerMove(pointerEvent) {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;
    const angleDifference = normalizeAngleDifference(getPointerAngle(pointerEvent, getDialCenter()) - dragState.startAngle);
    if (Math.abs(angleDifference) > DRAG_THRESHOLD_DEGREES) dragState.hasMoved = true;
    const nextRotation = dragState.startRotation + angleDifference;
    applyRotation(nextRotation, false);
    const indexUnderPointer = getIndexFromRotation(nextRotation);
    if (indexUnderPointer !== selectedIndex) onSelectIndex(indexUnderPointer);
  }

  function handlePointerEnd(pointerEvent) {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;
    dragState.isDragging = false;
    setTimeout(() => setShowSpeedLines(false), SPEED_LINES_FADE_MS);

    if (!dragState.hasMoved) {
      const tappedItem = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest(".d-item");
      if (tappedItem) {
        onSelectIndex(Number(tappedItem.dataset.index));
        return;
      }
    }
    const snappedRotation = Math.round(rotationRef.current / DEGREES_PER_CATEGORY) * DEGREES_PER_CATEGORY;
    applyRotation(snappedRotation, true);
    onSelectIndex(getIndexFromRotation(snappedRotation));
  }

  function handleKeyDown(keyboardEvent) {
    if (keyboardEvent.key === "ArrowRight" || keyboardEvent.key === "ArrowDown") {
      keyboardEvent.preventDefault();
      selectNext(1);
    }
    if (keyboardEvent.key === "ArrowLeft" || keyboardEvent.key === "ArrowUp") {
      keyboardEvent.preventDefault();
      selectNext(-1);
    }
  }

  const rotationStyle = { transform: `rotate(${rotationDegrees}deg)` };
  const snapClass = isSnapping ? " snap" : "";

  return (
    <section className="dial-sec" aria-label="Elegir categoría">
      <div className={`speed${showSpeedLines ? " go" : ""}`} aria-hidden="true" />
      <ChapterHeading number="01" nenKanji="纏">
        <span>
          <CrossTitle words={["Antojo", "De", "Hoy"]} />
        </span>
        <span className="jp" style={{ fontSize: ".7em", color: "var(--crimson)" }}>
          何食べる？
        </span>
      </ChapterHeading>

      <div className="cat-now">
        <CategoryBullet category={selectedCategory}>{zapReplayKey > 0 && <ElectricZap key={zapReplayKey} />}</CategoryBullet>
        <div>
          <h2>{selectedCategory.name}</h2>
          <span className="jpn">{selectedCategory.japaneseName}</span>
        </div>
        <span className="n">{String(placesInCategoryCount).padStart(2, "0")}</span>
      </div>

      <div
        className="dial-view"
        ref={dialViewRef}
        tabIndex={0}
        role="listbox"
        aria-label="Categorías, usa las flechas para girar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div className="pointer" />
        <div className={`dial${snapClass}`} ref={dialRef} style={rotationStyle} />
        <div className={`dial-items${snapClass}`} style={rotationStyle}>
          {CATEGORIES.map((category, categoryIndex) => (
            <div
              key={category.key}
              className="d-item"
              role="option"
              data-index={categoryIndex}
              aria-current={categoryIndex === selectedIndex ? "true" : "false"}
              style={{ transform: `rotate(${categoryIndex * DEGREES_PER_CATEGORY}deg) translateY(calc(var(--size) * -0.5 + 58px))` }}
            >
              <button type="button" tabIndex={-1}>
                <span className="bullet" style={categoryColorStyle(category)}>
                  {category.kanji}
                </span>
                <span className="lbl">{category.name}</span>
                <span className="jl">{category.japaneseName}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
        <button className="btn ghost" type="button" onClick={onOpenProphecy}>
          Pedir una profecía · 占い
        </button>
        <button className="btn ghost" type="button" onClick={onOpenJajanken}>
          ¿Quién elige? · じゃんけん
        </button>
        <button className="btn ghost" type="button" onClick={onOpenWaterCup}>
          Prueba de la copa · 水見式
        </button>
      </div>

      <div className="dial-hint">
        <button type="button" aria-label="Categoría anterior" onClick={() => selectNext(-1)}>
          ←
        </button>
        Arrastra o usa la rueda del mouse
        <button type="button" aria-label="Categoría siguiente" onClick={() => selectNext(1)}>
          →
        </button>
      </div>
    </section>
  );
}
