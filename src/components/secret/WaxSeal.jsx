const EDGE_POINTS = 36;
const SEAL_CENTER = 50;
const SEAL_RADIUS = 44;

/** Wavy outline of poured wax, drawn once. */
const WAX_OUTLINE_PATH =
  Array.from({ length: EDGE_POINTS }, (_, pointIndex) => {
    const angle = (pointIndex / EDGE_POINTS) * Math.PI * 2;
    const radius = SEAL_RADIUS + Math.sin(pointIndex * 2.3) * 2.6 + (pointIndex % 3 === 0 ? 1.8 : 0);
    const pointX = (SEAL_CENTER + Math.cos(angle) * radius).toFixed(1);
    const pointY = (SEAL_CENTER + Math.sin(angle) * radius).toFixed(1);
    return `${pointIndex ? "L" : "M"}${pointX} ${pointY}`;
  }).join("") + "Z";

/**
 * Red wax seal with 秘 in the middle.
 * half: "left" or "right" draws only that side of the crack, for the reveal animation.
 */
export function WaxSeal({ half, className = "" }) {
  const halfClass = half ? ` wax-seal-${half}` : "";
  return (
    <svg className={`wax-seal${halfClass} ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <path className="wax-seal-blob" d={WAX_OUTLINE_PATH} />
      <circle className="wax-seal-ring" cx={SEAL_CENTER} cy={SEAL_CENTER} r="31" />
      <path className="wax-seal-shine" d="M28 33q8-12 22-13" />
      <text className="wax-seal-kanji" x={SEAL_CENTER} y={SEAL_CENTER}>
        秘
      </text>
    </svg>
  );
}
