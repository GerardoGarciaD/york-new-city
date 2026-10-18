import { useEffect, useMemo, useState } from "react";

const ZAP_DURATION_MS = 700;
const ZAP_CENTER = 40;
const ZAP_POINTS = 6;

/** A random jagged line around the badge center, as SVG "x,y x,y …" points. */
function createLightningPoints() {
  let angle = Math.random() * Math.PI * 2;
  const points = [];
  for (let pointIndex = 0; pointIndex < ZAP_POINTS; pointIndex++) {
    const distanceFromCenter = 34 + Math.random() * 12;
    const pointX = ZAP_CENTER + Math.cos(angle) * distanceFromCenter;
    const pointY = ZAP_CENTER + Math.sin(angle) * distanceFromCenter;
    points.push(`${pointX.toFixed(1)},${pointY.toFixed(1)}`);
    angle += 0.35 + Math.random() * 0.3;
  }
  return points.join(" ");
}

/** Killua's electric spark around the category badge. Mount it with a new key to replay. */
export function ElectricZap() {
  const [isVisible, setIsVisible] = useState(true);
  const [mainBolt, secondBolt] = useMemo(() => [createLightningPoints(), createLightningPoints()], []);

  useEffect(() => {
    const hideTimer = setTimeout(() => setIsVisible(false), ZAP_DURATION_MS);
    return () => clearTimeout(hideTimer);
  }, []);

  if (!isVisible) return null;
  return (
    <svg className="zap" viewBox="0 0 80 80" aria-hidden="true">
      <polyline points={mainBolt} />
      <polyline points={mainBolt} />
      <polyline points={secondBolt} />
    </svg>
  );
}
