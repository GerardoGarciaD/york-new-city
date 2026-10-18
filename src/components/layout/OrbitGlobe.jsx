const ORBIT_RADIUS_PX = 44;
const LATIN_TEXT = "YORK NEW CITY · ";
const JAPANESE_TEXT = "ヨークシン";

/** Each letter of the orbiting title, flagged when it's Japanese so it gets the red manga style. */
const ORBIT_LETTERS = [
  ...[...LATIN_TEXT].map((letter) => ({ letter, isJapanese: false })),
  ...[...JAPANESE_TEXT].map((letter) => ({ letter, isJapanese: true })),
  { letter: " ", isJapanese: false },
  { letter: "·", isJapanese: false },
  { letter: " ", isJapanese: false },
];

/** Small globe with a red × on New York and the title spinning around it. */
export function OrbitGlobe() {
  const degreesPerLetter = 360 / ORBIT_LETTERS.length;

  return (
    <div className="orb" role="img" aria-label="York New City">
      <span className="aura-ring" aria-hidden="true" />
      <svg className="earth" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="#8fd3f0" stroke="#151612" strokeWidth="2" />
        <path d="M9 15c4-4 9-3 11 1s-2 6 1 9-1 7-4 7-6-4-8-7-3-6 0-10z" fill="#2c9a46" stroke="#151612" strokeWidth="1.3" />
        <path d="M27 9c5 0 9 3 11 7-3 1-5 0-7 2s0 5-3 6-4-3-4-6 0-6 3-9z" fill="#2c9a46" stroke="#151612" strokeWidth="1.3" />
        <path d="M30 31c3-1 6 1 6 4s-3 4-5 3-3-5-1-7z" fill="#2c9a46" stroke="#151612" strokeWidth="1.3" />
        <ellipse cx="24" cy="24" rx="9" ry="21" fill="none" stroke="#151612" strokeWidth=".8" opacity=".35" />
        <path d="M3 24h42" stroke="#151612" strokeWidth=".8" opacity=".35" />
        <g stroke="#e2382b" strokeWidth="2.6" strokeLinecap="round">
          <path d="M17.5 16.5l4 4M21.5 16.5l-4 4" />
        </g>
      </svg>
      <div className="orbit">
        <div className="ring-text">
          {ORBIT_LETTERS.map(({ letter, isJapanese }, letterIndex) => (
            <span
              key={letterIndex}
              className={isJapanese ? "k" : undefined}
              aria-hidden="true"
              style={{ transform: `rotateY(${letterIndex * degreesPerLetter}deg) translateZ(${ORBIT_RADIUS_PX}px)` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
