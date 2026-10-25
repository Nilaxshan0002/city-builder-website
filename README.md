# City Builder

A relaxed, interactive city-building game built with React 19, TypeScript, TanStack Start, Vite, and Netlify. Create a neighborhood on a custom illustrated isometric map, manage a treasury, earn daily income, and complete milestones.

Features include eight building types, categorized construction tools, building inspection, demolition with partial refunds, zoom, day/night views, adjustable simulation speed, optional construction sounds, editable city names, city statistics, and cloud saves.

## Run locally

Use Node.js 22.13+ or 24 and pnpm:

```sh
pnpm install
netlify dev --port 8889
```

The Netlify development environment provides the save function and database integration. Use `pnpm dev` for frontend-only development; cloud saves require Netlify. Production builds are handled by Netlify.

## Saving

Click **Save city** to store the current game in Netlify Database. A random save identifier in browser storage restores the same city when returning in that browser. This is an anonymous game without accounts or cross-device recovery. Clearing browser site data removes access to that save. Progress is saved explicitly rather than automatically. Cloud errors are reported without interrupting gameplay.

## Structure

- `src/routes/index.tsx`: game interface and simulation state.
- `src/game/model.ts`: building catalog, initial map, metrics, and validation.
- `src/game/Building.tsx`: original SVG illustrations.
- `src/styles.css`: responsive theme, motion, and day/night presentation.
- `netlify/functions/city.mts`: validated cloud save/load endpoint.
- `db/schema.ts`: Drizzle schema; generated migrations live in `netlify/database/migrations`.

Netlify applies database migrations during deployment. No credentials are needed in frontend code.
