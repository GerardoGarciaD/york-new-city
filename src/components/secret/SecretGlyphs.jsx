import { useMemo } from "react";
import { createSeededRandom } from "../../utils/random";

const GLYPH_WIDTH = 12;
const GLYPH_HEIGHT = 16;
const WORD_COUNT = 2;
const MIN_WORD_LENGTH = 3;
const EXTRA_WORD_LENGTH = 4;

/** An invented alphabet, drawn in a 12×16 box. Purely decorative: it spells nothing. */
const GLYPH_PATHS = [
  "M6 2L10 8L6 14L2 8ZM6 6v4",
  "M2 4q4-3 8 0M6 4v10M3 11h6",
  "M3 2v12M3 8l6-5M3 8l6 6M9 8h.01",
  "M6 4a4 4 0 1 1-.01 0M6 8h.01M6 12v2",
  "M2 13q4-12 8 0M6 13V9",
  "M2 3h8v5H2zM6 8v6M4 14h4",
  "M2 8h8M4 3l4 10M8 3l-4 10",
  "M3 3q6 0 6 5t-6 5M3 8h3",
  "M2 6l4-4 4 4M6 2v12M3 14q3-3 6 0",
  "M6 2v12M2 6q4 4 8 0M3 13h6",
  "M2 5h8M2 11h8M6 2v3M6 11v3M4 8h4",
  "M9 3q-7 2-3 6t-3 5M9 9h.01",
];

/** Two made-up words, always the same for the same place so the fake name doesn't flicker. */
function buildWords(seed) {
  const random = createSeededRandom(seed);
  return Array.from({ length: WORD_COUNT }, () => {
    const wordLength = MIN_WORD_LENGTH + Math.floor(random() * EXTRA_WORD_LENGTH);
    return Array.from({ length: wordLength }, () => GLYPH_PATHS[Math.floor(random() * GLYPH_PATHS.length)]);
  });
}

/** Fake name written in the secret alphabet. Its size follows the font size of where it sits. */
export function SecretGlyphs({ seed, className = "" }) {
  const words = useMemo(() => buildWords(seed), [seed]);

  return (
    <span className={`secret-glyphs ${className}`} aria-hidden="true">
      {words.map((glyphPaths, wordIndex) => (
        <svg
          key={wordIndex}
          viewBox={`0 0 ${glyphPaths.length * GLYPH_WIDTH} ${GLYPH_HEIGHT}`}
          style={{ width: `${(glyphPaths.length * GLYPH_WIDTH) / GLYPH_HEIGHT}em` }}
        >
          {glyphPaths.map((glyphPath, glyphIndex) => (
            <path key={glyphIndex} d={glyphPath} transform={`translate(${glyphIndex * GLYPH_WIDTH} 0)`} />
          ))}
        </svg>
      ))}
    </span>
  );
}
