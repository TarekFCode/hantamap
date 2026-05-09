# HantaTracker Claude Guide

Read this first to avoid spending context on rediscovery. This project is a Vite + React + TypeScript app for a live hantavirus / Andes virus outbreak map at `https://hantamap.netlify.app/`.

## What This App Is

HantaTracker displays a MapLibre GL JS globe with:

- red countries: confirmed
- orange countries: suspected
- purple countries: monitoring
- circle dots for outbreak data points
- popup details on outbreak dots only
- right-side live news panel
- password-protected admin page at `/?admin=true`

The app is focused on the current MV Hondius / Andes hantavirus outbreak, not all historical hantavirus presence worldwide.

## Key Files

- `src/App.tsx`: app shell, MapLibre setup, country fill layers, marker layer, stats, ticker
- `src/styles.css`: all layout and visual styling
- `src/data/outbreaks.ts`: default outbreak dataset
- `src/data/outbreakStorage.ts`: localStorage and Netlify function data loading
- `src/components/Admin.tsx`: admin dashboard, password `hantamanta2026`
- `src/components/NewsFeed.tsx`: GNews + fallback source panel
- `scripts/update-data.js`: local update script run by `npm run update`
- `netlify/shared/outbreak-classifier.js`: shared country/status classifier
- `netlify/shared/outbreak-store.js`: Netlify Blob default data and normalization
- `netlify/functions/check-updates.js`: live data endpoint read by frontend
- `netlify/functions/scheduled-update.js`: scheduled source scraper
- `index.html`: SEO metadata, JSON-LD, noscript fallback
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`: crawler support

## Commands

```powershell
npm install
npm run dev
npm run build
npm run update
npx --yes netlify-cli deploy --build --prod
```

`npm run update` is not just a scraper. It rewrites `src/data/outbreaks.ts`, then runs `git add .`, commits with `Auto update outbreak data`, and pushes. Use carefully if unrelated files are dirty.

For safe updater testing without Git:

```powershell
node scripts/update-data.js --no-git
```

## Data Model

Each outbreak item has:

```ts
{
  name: string;
  latitude: number;
  longitude: number;
  confirmedCases: number;
  deaths: number;
  status: "confirmed" | "suspected" | "monitoring";
}
```

The updater can add countries not already in `src/data/outbreaks.ts` only if the country exists in `COUNTRY_CATALOG` in `netlify/shared/outbreak-classifier.js`.

If a future source mentions a missing country, add it to `COUNTRY_CATALOG` with coordinates and aliases.

## Runtime Data Priority

The public site reads data in this order:

1. localStorage key `hantatracker.outbreaks`
2. `/.netlify/functions/check-updates`
3. bundled default `src/data/outbreaks.ts`

Stale localStorage can make the browser show old map data. Clear `hantatracker.outbreaks` if needed.

## Netlify

`netlify.toml` config:

- build: `npm run build`
- publish: `dist`
- functions: `netlify/functions`
- scheduled function: `scheduled-update` every 6 hours

Live data endpoint:

`https://hantamap.netlify.app/.netlify/functions/check-updates`

Direct deploy has been used successfully:

```powershell
npx --yes netlify-cli deploy --build --prod
```

GitHub push may fail in non-interactive shells if credentials are unavailable.

## News Feed

`NewsFeed.tsx` uses GNews:

- env var: `VITE_GNEWS_TOKEN`
- a hardcoded fallback token exists because Netlify/manual deploys previously lost env vars
- official fallback links should still display if GNews fails

Do not use GNews article snippets as source-of-truth for outbreak map classification. The updater intentionally uses fixed public source pages because GNews summaries caused false status upgrades.

## Important Past Bugs

- USA was the only purple country because old data only had USA as `monitoring`.
- A previous classifier over-promoted USA/Canada to confirmed/suspected because it matched broad sentences like “countries are monitoring people before cases were confirmed.”
- Fix: source-page-only updater, country-list parsing, stricter country/status linking, and no death inference unless direct counts or explicit narratives exist.
- The map may look stale if Netlify shared data or localStorage still contains older entries.

## Current Crawling/SEO

Implemented:

- description tag
- canonical URL
- robots meta
- Open Graph tags
- Twitter tags
- JSON-LD for website/app/dataset
- noscript fallback
- `robots.txt`
- `sitemap.xml`
- `llms.txt`

## Style Preferences

Keep the app dark, serious, and clean. Avoid landing-page fluff. The first screen should remain the actual tracking interface.
