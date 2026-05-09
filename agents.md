# HantaTracker Agent Guide

This is a Vite + React + TypeScript app that shows a MapLibre GL JS globe for the MV Hondius / Andes hantavirus outbreak. The live site is `https://hantamap.netlify.app/`.

## Quick Commands

- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Daily data update: `npm run update`
- Deploy directly to Netlify: `npx --yes netlify-cli deploy --build --prod`

`npm run update` fetches source pages, updates `src/data/outbreaks.ts`, then runs `git add .`, commits as `Auto update outbreak data`, and pushes. It can add new countries if they exist in `COUNTRY_CATALOG` in `netlify/shared/outbreak-classifier.js` and source text clearly marks them as confirmed, suspected, or monitoring.

## Architecture

- Main app: `src/App.tsx`
- Map styles/layout: `src/styles.css`
- Default outbreak data: `src/data/outbreaks.ts`
- Local/browser data loader: `src/data/outbreakStorage.ts`
- Admin dashboard: `src/components/Admin.tsx`
- News feed: `src/components/NewsFeed.tsx`
- Local updater: `scripts/update-data.js`
- Shared outbreak classifier: `netlify/shared/outbreak-classifier.js`
- Netlify data store helpers: `netlify/shared/outbreak-store.js`
- Netlify read function: `netlify/functions/check-updates.js`
- Netlify scheduled updater: `netlify/functions/scheduled-update.js`
- SEO/crawler files: `index.html`, `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`

## Map Behavior

The map uses MapLibre GL JS with a globe projection. It loads countries from:

`https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson`

Status colors:

- `confirmed`: red
- `suspected`: orange
- `monitoring`: purple

Country fills and outlines are added before marker dots so dots stay visible. Only outbreak dots are clickable; country fill selection UI was intentionally removed.

## Data Flow

Startup flow:

1. `src/data/outbreaks.ts` provides defaults.
2. `src/data/outbreakStorage.ts` reads localStorage first.
3. The app calls `/.netlify/functions/check-updates`.
4. If Netlify returns valid data, it writes it to localStorage and refreshes the map.

Important gotcha: localStorage can override bundled defaults in a browser. If the live map seems stale after data changes, clear `hantatracker.outbreaks` from localStorage or let `check-updates` overwrite it.

## Admin

Admin is visible only at `/?admin=true`.

- Password: `hantamanta2026`
- Auth is stored in `sessionStorage`.
- Saves write to localStorage for that browser only. This does not update GitHub or Netlify shared data.

## Update Sources

The update pipeline currently uses fixed public source pages, not GNews, for outbreak classification. GNews is only for the visible news feed.

Source URLs live in both:

- `scripts/update-data.js`
- `netlify/functions/scheduled-update.js`

If adding a source, keep both lists in sync unless you refactor them into shared code.

The classifier can infer countries from list sentences such as countries monitoring exposed passengers. Add new countries and coordinates in `COUNTRY_CATALOG` inside `netlify/shared/outbreak-classifier.js`.

## News Feed

`src/components/NewsFeed.tsx` uses GNews:

- Env var: `VITE_GNEWS_TOKEN`
- There is also a temporary hardcoded fallback token in the component for Netlify/manual deploy reliability.
- If live API fetch fails, the component should still show official fallback source links.

## Netlify

`netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- `scheduled-update` runs every 6 hours.

Live data endpoint:

`https://hantamap.netlify.app/.netlify/functions/check-updates`

Direct deploy has been used because GitHub auth is not always available in non-interactive shells.

## SEO And Crawlers

The project includes:

- Meta description, robots tag, canonical link
- Open Graph tags
- Twitter tags
- JSON-LD for `WebSite`, `WebApplication`, and `Dataset`
- `<noscript>` fallback in `index.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/llms.txt`

## Safety Notes

- Do not commit `.env`; `.gitignore` already excludes it.
- Do not run destructive Git commands.
- Be careful with `npm run update`: it commits and pushes all staged changes via `git add .`.
- If the user asks about current outbreak facts, browse or verify sources because the event is changing quickly.
