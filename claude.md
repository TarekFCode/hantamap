# HantaTracker Claude Guide

Read this first to avoid spending context on rediscovery. This project is a Vite + React + TypeScript app for a live hantavirus / Andes virus outbreak map at `https://hantamaps.com/`.

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
- `src/data/outbreakStorage.ts`: fetches `/data.json` at runtime; falls back to bundled default
- `src/components/Admin.tsx`: admin dashboard, password `hantamanta2026`
- `src/components/NewsFeed.tsx`: GNews + fallback source panel
- `scripts/update-data.js`: local/CI update script run by `npm run update`
- `scripts/outbreak-classifier.js`: country catalog and status classifier used by the updater
- `index.html`: SEO metadata, JSON-LD, noscript fallback
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`: crawler support
- `worker.js`: Cloudflare Worker wrapping static assets with no-cache headers on HTML/data
- `wrangler.jsonc`: Cloudflare Workers deployment config
- `.github/workflows/deploy.yml`: deploys to Cloudflare on push to main
- `.github/workflows/update-data.yml`: scheduled GitHub Actions workflow running every 6 hours

## Commands

```powershell
npm install
npm run dev
npm run build
npm run update
```

`npm run update` runs `scripts/update-data.js`. It fetches latest outbreak data, updates `src/data/outbreaks.ts`, `public/data.json`, `index.html`, and `public/sitemap.xml`, then git commits and pushes (which triggers the Cloudflare deploy workflow automatically).

For safe updater testing without Git:

```powershell
node scripts/update-data.js --no-git
```

## Deployment

The site is deployed to Cloudflare Workers via GitHub Actions:

- Push to `main` → `.github/workflows/deploy.yml` runs `wrangler deploy`
- Scheduled (every 6h) → `.github/workflows/update-data.yml` runs the updater, which commits and pushes, which then triggers the deploy workflow

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

The updater can add countries not already in `src/data/outbreaks.ts` only if the country exists in `COUNTRY_CATALOG` in `scripts/outbreak-classifier.js`.

If a future source mentions a missing country, add it to `COUNTRY_CATALOG` with coordinates and aliases.

## Runtime Data Priority

The public site reads data in this order:

1. localStorage key `hantatracker.outbreaks`
2. `/data.json` (static file, updated by the scheduled workflow)
3. bundled default `src/data/outbreaks.ts`

Stale localStorage can make the browser show old map data. Clear `hantatracker.outbreaks` if needed.

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
