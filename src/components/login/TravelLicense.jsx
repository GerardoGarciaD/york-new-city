import { forwardRef } from "react";
import { PEOPLE, PLAYER_KEYS } from "../../config/people";
import { GuillochePattern, Rosette } from "./GuillochePattern";

const MICRO_TEXT = "YORK NEW CITY · ヨークシン · 二人旅 · GOURMET HUNTERS · YORK NEW CITY · ヨークシン · 二人旅 ·";

function LicenseFront() {
  return (
    <div className="lf" aria-hidden="true">
      <div className="lc-top">
        <GuillochePattern width={250} height={178} lineCount={22} amplitude={6} seed={0} stroke="#7fd09a" strokeWidth=".6" />
        <span className="lc-kind">
          LICENCIA
          <br />
          DE VIAJE
        </span>
        <span className="lc-kind2">美食ハンター</span>
        <div className="lc-win">
          <svg viewBox="0 0 132 132">
            <Rosette />
            <circle cx="66" cy="66" r="30" fill="#8fd3f0" stroke="#151612" strokeWidth="2" />
            <path d="M47 57c5-6 12-5 14 1s-2 8 1 12-1 9-5 9-8-5-10-9-4-8 0-13z" fill="#2c9a46" stroke="#151612" strokeWidth="1.3" />
            <path d="M70 46c7 0 12 4 14 9-4 1-6 0-9 2s0 7-4 8-6-3-6-7 1-8 5-12z" fill="#2c9a46" stroke="#151612" strokeWidth="1.3" />
            <ellipse cx="66" cy="66" rx="13" ry="30" fill="none" stroke="#151612" strokeWidth=".9" opacity=".35" />
            <g stroke="#c42a1f" strokeWidth="3" strokeLinecap="round">
              <path d="M55 54l6 6M61 54l-6 6" />
            </g>
            <ellipse cx="66" cy="66" rx="52" ry="16" transform="rotate(-16 66 66)" fill="none" stroke="#151612" strokeWidth="1.6" />
          </svg>
        </div>
        <span className="lc-holo">旅</span>
      </div>
      <div className="lc-micro">{MICRO_TEXT}</div>
      <div className="lc-body">
        <GuillochePattern width={250} height={190} lineCount={18} amplitude={5} seed={2} stroke="#1d5f33" strokeWidth=".5" />
        <div className="lc-lic">
          <b>GOURMET HUNTERS</b>
          <span>二人旅</span>
        </div>
        <div className="lc-names">
          {PEOPLE.firstPlayer}
          <i>×</i>
          {PEOPLE.secondPlayer}
        </div>
        <div className="lc-num">2026 1017 0412 0002</div>
        <div className="lc-meta">
          <span>
            EXPEDIDA<b>17·10·26</b>
          </span>
          <span>
            DESTINO<b>NYC</b>
          </span>
          <span>
            RANGO<b>SS</b>
          </span>
        </div>
      </div>
      <div className="lc-shine" />
    </div>
  );
}

const LicenseBack = forwardRef(function LicenseBack(
  { selectedPlayer, onSelectPlayer, password, onChangePassword, errorMessage, onSubmit, onFlipBack },
  passwordInputRef,
) {
  return (
    <div className="lf lc-bk">
      <div className="lc-mag" aria-hidden="true" />
      <div className="lc-sig" aria-hidden="true">
        <div>
          {PEOPLE.firstPlayer} · {PEOPLE.secondPlayer}
        </div>
        <span>FIRMA</span>
      </div>
      <form className="lc-form" autoComplete="off" onSubmit={onSubmit}>
        <h2 id="loginTitle">
          Validar <i>×</i> Licencia
        </h2>
        <p className="lc-lab" id="loginPlayerLabel">
          Titular
        </p>
        <div className="lc-seg" role="group" aria-labelledby="loginPlayerLabel">
          {PLAYER_KEYS.map((playerKey) => (
            <button key={playerKey} type="button" aria-pressed={playerKey === selectedPlayer ? "true" : "false"} onClick={() => onSelectPlayer(playerKey)}>
              {PEOPLE[playerKey]}
            </button>
          ))}
        </div>
        <label className="lc-lab" htmlFor="loginPassword">
          Contraseña
        </label>
        <input
          ref={passwordInputRef}
          className="lc-pw"
          id="loginPassword"
          type="password"
          placeholder="••••••"
          autoComplete="current-password"
          value={password}
          onChange={(changeEvent) => onChangePassword(changeEvent.target.value)}
        />
        <p className="lc-err" aria-live="polite">
          {errorMessage}
        </p>
        <button className="lc-go" type="submit">
          ENTRAR
        </button>
        <button className="lc-back" type="button" onClick={onFlipBack}>
          ← Voltear licencia
        </button>
      </form>
    </div>
  );
});

/** The two-sided card. isFlipped shows the back with the login form. */
export const TravelLicense = forwardRef(function TravelLicense({ isFlipped, isLeaving, isShaking, backProps, passwordInputRef }, cardRef) {
  let className = "lc";
  if (isFlipped) className += " on";
  if (isLeaving) className += " bye";
  if (isShaking) className += " shake";
  return (
    <div className="lc-scene">
      <div className={className} ref={cardRef}>
        <div className="lc-in">
          <LicenseFront />
          <LicenseBack ref={passwordInputRef} {...backProps} />
        </div>
      </div>
    </div>
  );
});

