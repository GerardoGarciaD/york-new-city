import { useEffect, useRef } from "react";

const TOP_OFFSET_PX = 24;
const BOTTOM_MARGIN_PX = 60;
const BOBBER_OFFSET_PX = 9;

/** Gon's fishing line on the right edge: it lowers as you scroll. */
export function FishingLine() {
  const lineRef = useRef(null);
  const bobberRef = useRef(null);

  useEffect(() => {
    function updateLine() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const lineLength = TOP_OFFSET_PX + scrollProgress * (window.innerHeight - BOTTOM_MARGIN_PX);
      lineRef.current.style.height = `${lineLength}px`;
      bobberRef.current.style.top = `${lineLength + BOBBER_OFFSET_PX}px`;
    }
    updateLine();
    window.addEventListener("scroll", updateLine, { passive: true });
    window.addEventListener("resize", updateLine);
    return () => {
      window.removeEventListener("scroll", updateLine);
      window.removeEventListener("resize", updateLine);
    };
  }, []);

  return (
    <>
      <div className="line" ref={lineRef} aria-hidden="true" />
      <div className="bobber" ref={bobberRef} aria-hidden="true" />
    </>
  );
}
