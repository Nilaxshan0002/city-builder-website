# City Builder architecture

This React 19 / TypeScript game runs on TanStack Start and Netlify. The main route is a playable city rather than a marketing page.

## Key directories

- `src/routes/index.tsx` owns game state, simulation timers, construction actions, navigation, dialogs, and explicit cloud saves.
- `src/game/model.ts` defines the eight building types, 12×12 initial map, city Zod schema, and derived statistics. Keep gameplay rules and validation aligned here.
- `src/game/Building.tsx` renders reusable original SVG buildings in map and catalog views. All illustrations are code-native; no raster image dependency.
- `src/styles.css` contains base Tailwind variables and the City Builder responsive layout. The palette is sage, cream, muted teal, and terracotta. Motion respects reduced-motion preferences.
- `src/routes/__root.tsx` defines metadata, font links, and shared UI providers.
- `netlify/functions/city.mts` validates anonymous save requests and persists to Netlify Database using Drizzle's Netlify adapter.
- `db/schema.ts` is the database schema source. `drizzle.config.ts` sends generated migrations to `netlify/database/migrations`. Netlify applies these; never manually push schema changes.

## Conventions and decisions

Use functional React updates for mutations. Metrics are derived from tiles, and no separate metric state should drift from the map. One simulated day lasts 20 seconds at 1×; paused and 3× modes change the timer. A city uses a 144-element tile array, row-major, with isometric SVG coordinates. Rivers cannot be built on or demolished. Trees can be replaced. Demolition returns half the building cost.

Browser storage holds only an anonymous UUID capability for retrieving a cloud save; it never holds city data. Read browser APIs inside effects or event handlers to preserve SSR hydration. Saving is manual and loading happens once per mount. This is a casual game without accounts, competitive leaderboards, or anti-cheat guarantees; do not present saves as authenticated user accounts. Keep failures visible through toasts while preserving current game state.

Use existing Radix dialog components for keyboard-accessible overlays, label icon buttons, and preserve keyboard activation of map tiles. Keep mobile controls usable. Do not edit generated route tree files. Do not expose environment variables or credentials.

The deployment pipeline performs builds and validation. Do not run build, typecheck, test, or dev-server commands during automated editing runs. Read edited files to review changes. Database migration generation is permitted and required when the schema changes.
