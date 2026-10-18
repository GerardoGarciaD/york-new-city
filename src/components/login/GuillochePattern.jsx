import { useMemo } from "react";

/**
 * Fine wavy security lines, like on banknotes and IDs.
 * lineCount lines across a width × height box, each a sum of two sine waves.
 */
function createWavyLinePaths(width, height, lineCount, amplitude, seed) {
  const paths = [];
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const baseline = (height * (lineIndex + 0.5)) / lineCount;
    let pathData = "";
    for (let positionX = 0; positionX <= width; positionX += 3) {
      const positionY =
        baseline +
        amplitude * Math.sin(positionX * 0.045 + lineIndex * 0.5 + seed) +
        amplitude * 0.5 * Math.sin(positionX * 0.11 - lineIndex * 0.3);
      pathData += `${positionX ? "L" : "M"}${positionX} ${positionY.toFixed(1)}`;
    }
    paths.push(pathData);
  }
  return paths;
}

export function GuillochePattern({ width, height, lineCount, amplitude, seed, stroke, strokeWidth }) {
  const linePaths = useMemo(() => createWavyLinePaths(width, height, lineCount, amplitude, seed), [width, height, lineCount, amplitude, seed]);
  return (
    <svg className="gl" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <g fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        {linePaths.map((pathData, lineIndex) => (
          <path key={lineIndex} d={pathData} />
        ))}
      </g>
    </svg>
  );
}

const ROSETTE_ELLIPSES = 24;

/** Rosette of rotated ellipses behind the globe emblem. */
export function Rosette() {
  const ellipseAngles = useMemo(() => [...Array(ROSETTE_ELLIPSES).keys()].map((ellipseIndex) => ellipseIndex * 7.5), []);
  return (
    <g fill="none" stroke="#1d5f33" strokeWidth=".5" opacity=".5">
      {ellipseAngles.map((angle) => (
        <ellipse key={angle} cx="66" cy="66" rx="62" ry="22" transform={`rotate(${angle} 66 66)`} />
      ))}
    </g>
  );
}
