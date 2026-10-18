/** Footer with small emblems and Wing's four steps of 燃. */
export function SiteFooter() {
  return (
    <footer className="wrap foot">
      <div className="emblems" aria-hidden="true">
        <svg viewBox="0 0 30 30">
          <path d="M15 3v13" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <ellipse cx="15" cy="21" rx="5" ry="6.5" fill="var(--crimson)" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10.2 21h9.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.5 21a4.6 5.7 0 0 0 9 0" fill="#fff" />
        </svg>
        <svg viewBox="0 0 30 30">
          <path d="M17 3 8 17h6l-2 10 10-15h-6z" fill="#7fd6ff" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 30 30">
          <ellipse cx="10" cy="15" rx="7" ry="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M14 15h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M14 15h12" stroke="#d6d9d1" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 30 30">
          <rect x="4" y="10" width="22" height="15" rx="2.5" fill="var(--gold)" stroke="currentColor" strokeWidth="1.8" />
          <path d="M11 10V7.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 19 7.5V10M4 16h22" stroke="currentColor" strokeWidth="1.8" fill="none" />
        </svg>
        <svg viewBox="0 0 30 30">
          <text x="15" y="22" textAnchor="middle" fontSize="19" fill="var(--crimson)" fontFamily="Dela Gothic One, sans-serif">
            ♠
          </text>
        </svg>
      </div>
      <div className="moe">
        点・舌・練・発 <b>燃</b>
      </div>
      <small>Viaje a York New City · 二人旅</small>
    </footer>
  );
}
