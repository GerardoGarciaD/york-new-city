/** "Cap. 01 · 纏" label followed by the chapter content. */
export function ChapterHeading({ number, nenKanji, style, children }) {
  return (
    <div className="chap" style={style}>
      <span className="no">
        Cap. {number} · <span className="jp">{nenKanji}</span>
      </span>
      {children}
    </div>
  );
}
