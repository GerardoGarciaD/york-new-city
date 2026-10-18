import { Fragment } from "react";

/** Renders words joined by the red "×", like chapter titles: Antojo × De × Hoy. */
export function CrossTitle({ words }) {
  return words.map((word, wordIndex) => (
    <Fragment key={`${word}-${wordIndex}`}>
      {wordIndex > 0 && (
        <>
          {" "}
          <span className="x">×</span>{" "}
        </>
      )}
      {word}
    </Fragment>
  ));
}
