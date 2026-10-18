# Viaje a York New City

Lista de lugares para comer en Nueva York para dos viajeros, hecha con React y Vite.

## Cómo correrlo

```bash
yarn install
yarn db:user LM contraseña   # crea a cada viajero (una vez)
yarn db:user GG contraseña
yarn db:seed                 # opcional: carga los lugares de ejemplo
yarn dev                     # front + API, abre http://localhost:5173
```

En local la base de datos es un archivo (`server/data/yorknew.db`), no necesitas ninguna cuenta.

## Cómo funciona

- **Front** (React + Vite) en `src/`.
- **API** (Hono) en `server/app.js`: login y lugares. En local la levanta `server/dev.js`; en Vercel, `api/index.js`.
- **Base de datos** SQLite: un archivo en local, [Turso](https://turso.tech) en internet. Dos tablas: `users` (los dos viajeros) y `places` (cada lugar guardado como JSON).
- No hay registro: los usuarios se crean con `yarn db:user`. El mismo comando cambia la contraseña. Si quieren una sola contraseña, pónganle la misma a los dos.
- Cada teléfono vuelve a pedir la lista cada 15 segundos y al regresar a la pestaña, así ven lo que agregó el otro.
- **Lugares secretos (秘密)**: al agregar un lugar se puede "Guardar como secreto". La API solo le manda al otro el número de lote y de quién es, así que ve un lote sellado. Solo quien lo creó puede revelarlo. Hasta entonces no cuenta para la profecía, la arena ni los visitados. Componentes en `src/components/secret/`, estilos en `src/styles/secret-place.css`.

## Publicarlo para usarlo en los dos celulares

1. **Base de datos en Turso** (gratis). Crea una cuenta en turso.tech y una base de datos. Copia su URL (`libsql://…`) y crea un token.
2. **Archivo `.env`** en la raíz del proyecto (no se sube a git):
   ```
   TURSO_DATABASE_URL=libsql://tu-base.turso.io
   TURSO_AUTH_TOKEN=el-token
   ```
   Con eso, `yarn db:user` y `yarn db:seed` escriben en Turso. Crea ahí a los dos viajeros. Mientras exista el `.env`, `yarn dev` también usa Turso.
3. **Vercel**: importa el repo desde vercel.com (detecta Vite solo). En *Settings → Environment Variables* agrega:
   - `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` (los mismos de arriba)
   - `SESSION_SECRET`: un texto largo al azar, por ejemplo el que da `openssl rand -hex 32`
4. Abran la URL de Vercel en los dos celulares. Desde el navegador pueden usar "Agregar a pantalla de inicio".

## Cambios rápidos

| Quiero cambiar…            | Dónde                           |
| -------------------------- | ------------------------------- |
| Los nombres (LM, GG)       | `src/config/people.js`          |
| Una contraseña             | `yarn db:user LM nueva`   |
| Categorías, kanji, colores | `src/config/categories.js`      |
| Lugares de ejemplo         | `src/config/places.js`          |
| Profecía, copa, jajanken   | `src/config/fortune.js`         |
| Colores y tipografías      | `src/styles/tokens.css`         |

## Estructura

```
api/index.js                Entrada de la API en Vercel
server/                     API (app.js), base de datos (db.js) y contraseñas/tokens (auth.js)
scripts/                    Crear usuarios y cargar lugares de ejemplo
src/
  main.jsx                  Punto de entrada
  App.jsx                   Arma la página y conecta todo
  config/                   Datos y textos editables
  context/ToastContext.jsx  Mensajito flotante de abajo
  hooks/                    Lugares, sesión y preferencia de movimiento reducido
  services/                 Llamadas a la API (login y lugares)
  utils/                    Formatos de precio, lote, etc.
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
