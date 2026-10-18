# Viaje a York New City

Lista de lugares para comer en Nueva York para dos viajeros, hecha con React y Vite.

## Cómo correrlo

```bash
npm install
npm run dev       # abre http://localhost:5173
npm run build     # genera la carpeta dist/ lista para subir
npm run preview   # prueba la versión de dist/
```

Para publicarlo, sube el proyecto a Vercel o Netlify (detectan Vite solos) o sube la carpeta `dist/` a cualquier hosting estático.

## Cambios rápidos

| Quiero cambiar…            | Archivo                         |
| -------------------------- | ------------------------------- |
| Los nombres (LM, GG)       | `src/config/people.js`          |
| La contraseña              | `src/config/auth.js` (ver abajo) |
| Categorías, kanji, colores | `src/config/categories.js`      |
| Lugares de ejemplo         | `src/config/places.js`          |
| Profecía, copa, jajanken   | `src/config/fortune.js`         |
| Colores y tipografías      | `src/styles/tokens.css`         |

### Cambiar la contraseña

La contraseña actual es `yorknew` (no distingue mayúsculas). Para poner otra:

```bash
npm run hash-password -- nuevaContraseña
```

Copia el resultado en `PASSWORD_HASH` dentro de `src/config/auth.js`. El login es una puerta amistosa, no seguridad real: no uses una contraseña que uses en otro lado.

## Dónde se guardan los datos

En el navegador de cada quien (`localStorage`), así que cada dispositivo tiene su propia lista. Para compartirla entre los dos, crea otro repositorio con las mismas funciones que `src/services/placesRepository.js` (por ejemplo con Supabase) y cámbialo en `src/hooks/usePlaces.js`. El resto de la app no se toca.

## Estructura

```
src/
  main.jsx                  Punto de entrada
  App.jsx                   Arma la página y conecta todo
  config/                   Datos y textos editables
  context/ToastContext.jsx  Mensajito flotante de abajo
  hooks/                    Lugares, sesión y preferencia de movimiento reducido
  services/                 Dónde se guardan los lugares
  utils/                    Formatos de precio, lote, hash, etc.
  styles/                   CSS original dividido por sección (el orden de index.css importa)
  components/
    layout/                 Barra, globo, encabezado, cadenas, hilo de pescar, pie
    dial/                   Dial de categorías y chispa eléctrica
    ring/                   Rueda 3D de tarjetas
    list/                   Lista, filtro y arena celestial
    dialogs/                Formulario, detalle, profecía, copa y jajanken
    login/                  Licencia de viaje para entrar
    common/                 Piezas reutilizables (modal, chips, títulos con ×)
```

Los estilos son los mismos del diseño original: las clases CSS no cambiaron, solo se dividieron en archivos.
