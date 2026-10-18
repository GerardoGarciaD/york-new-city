import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * Kurapika-style chain drawn on a canvas: interlocked links following an irregular wave,
 * an anchor ring on the left and a crystal pendulum swinging on the right.
 */
const INK_COLOR = "#151612";
const LIGHT_METAL_COLOR = "#d6d9d1";
const MAX_PIXEL_RATIO = 1.5;
const WAVE_BASELINE_PX = 18;
const LINK_LENGTH_PX = 7;
const RIGHT_MARGIN_PX = 28;
const LEFT_START_PX = 8;
const SAMPLE_STEP_PX = 3;
const PENDULUM_LENGTH_PX = 26;
const PENDULUM_LINKS = 3;

/** Vertical position of the wave at a given horizontal position and time. */
function getWaveHeight(positionX, totalWidth, timeMs, seed) {
  const progress = positionX / totalWidth;
  const envelope = 0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, progress * 1.08));
  const slowWave = 5.5 * Math.sin(positionX * 0.019 + timeMs * 0.0014 + seed);
  const mediumWave = 3.2 * Math.sin(positionX * 0.047 - timeMs * 0.0021 + seed * 1.7);
  const fastWave = 1.6 * Math.sin(positionX * 0.103 + timeMs * 0.0037);
  return WAVE_BASELINE_PX + envelope * (slowWave + mediumWave + fastWave);
}

function drawLink(context, pixelRatio, metalGradient, centerX, centerY, angle, length, isFacingUs) {
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.beginPath();
  if (isFacingUs) {
    context.ellipse(0, 0, length * 0.98, 3, 0, 0, Math.PI * 2);
    context.lineWidth = 2.4;
    context.strokeStyle = INK_COLOR;
    context.stroke();
    context.lineWidth = 1.1;
    context.strokeStyle = metalGradient;
    context.stroke();
  } else {
    context.moveTo(-length * 0.6, 0);
    context.lineTo(length * 0.6, 0);
    context.lineWidth = 3.2;
    context.strokeStyle = INK_COLOR;
    context.stroke();
    context.lineWidth = 1.2;
    context.strokeStyle = LIGHT_METAL_COLOR;
    context.stroke();
  }
}

function drawChain(context, pixelRatio, metalGradient, width, height, timeMs, seed) {
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);
  if (!width) return;

  // Sample the wave, then place links evenly from end to end so both ends stay attached.
  const wavePoints = [];
  for (let positionX = LEFT_START_PX; positionX <= width - RIGHT_MARGIN_PX; positionX += SAMPLE_STEP_PX) {
    wavePoints.push([positionX, getWaveHeight(positionX, width, timeMs, seed)]);
  }
  const distanceAlongWave = [0];
  for (let pointIndex = 1; pointIndex < wavePoints.length; pointIndex++) {
    const [previousX, previousY] = wavePoints[pointIndex - 1];
    const [currentX, currentY] = wavePoints[pointIndex];
    distanceAlongWave.push(distanceAlongWave[pointIndex - 1] + Math.hypot(currentX - previousX, currentY - previousY));
  }
  const totalLength = distanceAlongWave[distanceAlongWave.length - 1];
  const linkCount = Math.max(2, Math.round(totalLength / LINK_LENGTH_PX));
  const linkSpacing = totalLength / linkCount;

  let segmentIndex = 1;
  for (let linkIndex = 0; linkIndex <= linkCount; linkIndex++) {
    const targetDistance = Math.min(totalLength, linkIndex * linkSpacing);
    while (segmentIndex < wavePoints.length - 1 && distanceAlongWave[segmentIndex] < targetDistance) segmentIndex++;
    const [startX, startY] = wavePoints[segmentIndex - 1];
    const [endX, endY] = wavePoints[segmentIndex];
    const segmentLength = distanceAlongWave[segmentIndex] - distanceAlongWave[segmentIndex - 1] || 1;
    const segmentProgress = (targetDistance - distanceAlongWave[segmentIndex - 1]) / segmentLength;
    drawLink(
      context,
      pixelRatio,
      metalGradient,
      startX + (endX - startX) * segmentProgress,
      startY + (endY - startY) * segmentProgress,
      Math.atan2(endY - startY, endX - startX),
      linkSpacing,
      linkIndex % 2 === 1,
    );
  }

  // Anchor ring the first link passes through.
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.beginPath();
  context.arc(wavePoints[0][0] - 2, wavePoints[0][1], 5.5, 0, Math.PI * 2);
  context.lineWidth = 3.2;
  context.strokeStyle = INK_COLOR;
  context.stroke();
  context.lineWidth = 1.3;
  context.strokeStyle = LIGHT_METAL_COLOR;
  context.stroke();

  // Dowsing pendulum hanging from the last link.
  const [chainEndX, chainEndY] = wavePoints[wavePoints.length - 1];
  const swingAngle = Math.sin(timeMs * 0.0022 + seed) * 0.32;
  const crystalX = chainEndX + Math.sin(swingAngle) * PENDULUM_LENGTH_PX;
  const crystalY = chainEndY + Math.cos(swingAngle) * PENDULUM_LENGTH_PX;
  const pendulumAngle = Math.atan2(crystalY - chainEndY, crystalX - chainEndX);
  for (let pendulumLinkIndex = 0; pendulumLinkIndex <= PENDULUM_LINKS; pendulumLinkIndex++) {
    const progress = pendulumLinkIndex / (PENDULUM_LINKS + 0.4);
    drawLink(
      context,
      pixelRatio,
      metalGradient,
      chainEndX + (crystalX - chainEndX) * progress,
      chainEndY + (crystalY - chainEndY) * progress,
      pendulumAngle,
      7,
      pendulumLinkIndex % 2 === 1,
    );
  }
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const crystalShine = context.createRadialGradient(crystalX - 2, crystalY - 2, 1, crystalX, crystalY, 7);
  crystalShine.addColorStop(0, "#ffffff");
  crystalShine.addColorStop(0.45, "#b9bdb3");
  crystalShine.addColorStop(1, "#4b5047");
  context.beginPath();
  context.moveTo(crystalX, crystalY - 7);
  context.lineTo(crystalX + 5.5, crystalY);
  context.lineTo(crystalX, crystalY + 9);
  context.lineTo(crystalX - 5.5, crystalY);
  context.closePath();
  context.fillStyle = crystalShine;
  context.fill();
  context.lineWidth = 1.8;
  context.strokeStyle = INK_COLOR;
  context.stroke();
}

export function ChainDivider({ seed = 0 }) {
  const canvasRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let metalGradient = null;
    let isOnScreen = true;
    let animationFrameId = 0;

    function resizeCanvas() {
      pixelRatio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.lineCap = "round";
      metalGradient = context.createLinearGradient(0, -3, 0, 3);
      metalGradient.addColorStop(0, "#fbfbf7");
      metalGradient.addColorStop(0.5, "#a7aba1");
      metalGradient.addColorStop(1, "#555a51");
    }

    function render(timeMs) {
      drawChain(context, pixelRatio, metalGradient, width, height, timeMs, seed);
    }

    function animate(timeMs) {
      if (isOnScreen) render(timeMs);
      animationFrameId = requestAnimationFrame(animate);
    }

    function handleResize() {
      resizeCanvas();
      if (prefersReducedMotion) render(0);
    }

    resizeCanvas();
    window.addEventListener("resize", handleResize);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
    });
    visibilityObserver.observe(canvas);

    if (prefersReducedMotion) render(0);
    else animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      visibilityObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [seed, prefersReducedMotion]);

  return (
    <div className="chain" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
