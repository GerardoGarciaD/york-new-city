import { CrossTitle } from "../common/CrossTitle";

const HEADLINE_ROWS = [
  { text: "Viaje a", isHighlighted: false },
  { text: "York New", isHighlighted: true },
  { text: "City", isHighlighted: false },
];

const ROW_DELAY_SECONDS = 0.12;
const LETTER_DELAY_SECONDS = 0.035;

/** Headline whose letters rise one by one when the page loads. */
function AnimatedHeadlineRow({ text, isHighlighted, rowIndex }) {
  return (
    <span className={isHighlighted ? "row gold" : "row"}>
      {[...text].map((letter, letterIndex) => (
        <span
          key={letterIndex}
          className="ch"
          aria-hidden="true"
          style={{ animationDelay: `${rowIndex * ROW_DELAY_SECONDS + letterIndex * LETTER_DELAY_SECONDS}s` }}
        >
          {letter === " " ? " " : letter}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section className="wrap hero">
      <span className="tate" aria-hidden="true">
        ニューヨーク・旅の記録
      </span>
      <h1 aria-label="Viaje a York New City">
        {HEADLINE_ROWS.map((row, rowIndex) => (
          <AnimatedHeadlineRow key={row.text} text={row.text} isHighlighted={row.isHighlighted} rowIndex={rowIndex} />
        ))}
      </h1>
      <div className="lede">
        <small>Gourmet hunters · 二人旅</small>
        <p className="kicker">
          <CrossTitle words={["Comer", "Y", "Explorar"]} />
        </p>
      </div>
    </section>
  );
}
