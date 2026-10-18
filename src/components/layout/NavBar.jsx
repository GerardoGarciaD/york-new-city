import { OrbitGlobe } from "./OrbitGlobe";

export function NavBar({ statsText, isLoggedIn, onLogOut, onAddPlace }) {
  return (
    <header className="wrap nav">
      <div className="brand">
        <OrbitGlobe />
      </div>
      <div className="stats">{statsText}</div>
      <div className="nav-right">
        <button className="logout" type="button" hidden={!isLoggedIn} onClick={onLogOut}>
          Salir
        </button>
        <button className="btn" type="button" onClick={onAddPlace}>
          + Agregar
        </button>
      </div>
    </header>
  );
}
