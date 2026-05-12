import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applySourceTextUpdates } from "../netlify/shared/outbreak-classifier.js";

const WHO_URL =
  "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599";
const SOURCE_URLS = [
  WHO_URL,
  "https://www.who.int/philippines/news/detail-global/07-05-2026-who-s-response-to-hantavirus-cases-linked-to-a-cruise-ship",
  "https://www.cbsnews.com/news/hantavirus-cruise-ship-mv-hondius-passengers-monitored-us-worldwide/",
  "https://www.cbsnews.com/amp/news/hantavirus-cruise-ship-mv-hondius-passengers-monitored-us-worldwide/",
  "https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak",
  "https://www.ungeneva.org/en/news-media/news/2026/05/118402/hantavirus-outbreak-cruise-ship-not-another-covid-who-says",
  "https://www.cdc.gov/han/php/notices/han00528.html",
  "https://www.cdc.gov/hantavirus/situation-summary/index.html",
  "https://www.cidrap.umn.edu/news-perspective",
  "https://outbreaknewstoday.com/?s=hantavirus",
  "https://en.wikipedia.org/wiki/MV_Hondius_hantavirus_outbreak",
];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "src", "data", "outbreaks.ts");
const publicDataPath = path.join(projectRoot, "public", "data.json");
const outbreakStorePath = path.join(
  projectRoot,
  "netlify",
  "shared",
  "outbreak-store.js",
);
const indexHtmlPath = path.join(projectRoot, "index.html");
const sitemapPath = path.join(projectRoot, "public", "sitemap.xml");
const shouldSkipGit = process.argv.includes("--no-git");

async function fetchText(url, userAgent) {
  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function htmlToText(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
}

async function fetchSourceTexts() {
  const results = await Promise.allSettled(
    SOURCE_URLS.map(async (url) => {
      const html = await fetchText(url, "HantaTracker daily data updater");
      return htmlToText(html);
    }),
  );

  return results
    .flatMap((result, index) => {
      if (result.status === "fulfilled") {
        return [result.value];
      }

      console.warn(`Source fetch failed for ${SOURCE_URLS[index]}:`, result.reason);
      return [];
    })
    .join(" ");
}

function parseExistingOutbreaks(source) {
  const objectPattern =
    /\{\s*name:\s*"([^"]+)",\s*latitude:\s*([-.\d]+),\s*longitude:\s*([-.\d]+),\s*confirmedCases:\s*(\d+),\s*deaths:\s*(\d+),\s*status:\s*"([^"]+)",\s*\}/g;
  const outbreaks = [];
  let match;

  while ((match = objectPattern.exec(source)) !== null) {
    outbreaks.push({
      name: match[1],
      latitude: Number(match[2]),
      longitude: Number(match[3]),
      confirmedCases: Number(match[4]),
      deaths: Number(match[5]),
      status: match[6],
    });
  }

  if (outbreaks.length === 0) {
    throw new Error(`No outbreak entries found in ${dataPath}`);
  }

  return outbreaks;
}

function formatOutbreaksFile(outbreaks) {
  const entries = outbreaks
    .map(
      (item) => `  {
    name: "${item.name.replaceAll('"', '\\"')}",
    latitude: ${item.latitude},
    longitude: ${item.longitude},
    confirmedCases: ${item.confirmedCases},
    deaths: ${item.deaths},
    status: "${item.status}",
  }`,
    )
    .join(",\n");

  return `export type OutbreakStatus = "confirmed" | "suspected" | "monitoring";

export type OutbreakDataPoint = {
  name: string;
  latitude: number;
  longitude: number;
  confirmedCases: number;
  deaths: number;
  status: OutbreakStatus;
};

export const hantavirusOutbreaks: OutbreakDataPoint[] = [
${entries},
];
`;
}

function createOutbreakDataPayload(outbreaks) {
  return {
    updatedAt: new Date().toISOString(),
    source: WHO_URL,
    outbreaks,
  };
}

function formatPublicDataFile(outbreaks) {
  return `${JSON.stringify(createOutbreakDataPayload(outbreaks), null, 2)}\n`;
}

function formatOutbreakObject(outbreak, indent = 4) {
  const spaces = " ".repeat(indent);
  const fieldSpaces = " ".repeat(indent + 2);

  return `${spaces}{
${fieldSpaces}name: "${outbreak.name.replaceAll('"', '\\"')}",
${fieldSpaces}latitude: ${outbreak.latitude},
${fieldSpaces}longitude: ${outbreak.longitude},
${fieldSpaces}confirmedCases: ${outbreak.confirmedCases},
${fieldSpaces}deaths: ${outbreak.deaths},
${fieldSpaces}status: "${outbreak.status}",
${spaces}}`;
}

function formatOutbreakStoreFile(outbreaks) {
  const entries = outbreaks.map((outbreak) => formatOutbreakObject(outbreak)).join(",\n");
  const payload = createOutbreakDataPayload(outbreaks);

  return `import { getStore } from "@netlify/blobs";

export const OUTBREAK_BLOB_KEY = "data.json";
export const OUTBREAK_STORE_NAME = "outbreak-data";

export const DEFAULT_OUTBREAK_DATA = {
  updatedAt: "${payload.updatedAt}",
  source: "${payload.source}",
  outbreaks: [
${entries},
  ],
};

const VALID_STATUSES = new Set(["confirmed", "suspected", "monitoring"]);

function normalizeOutbreak(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (
    typeof value.name !== "string" ||
    !Number.isFinite(value.latitude) ||
    !Number.isFinite(value.longitude) ||
    !Number.isFinite(value.confirmedCases) ||
    !Number.isFinite(value.deaths) ||
    !VALID_STATUSES.has(value.status)
  ) {
    return null;
  }

  return {
    name: value.name,
    latitude: value.latitude,
    longitude: value.longitude,
    confirmedCases: Math.max(0, Math.round(value.confirmedCases)),
    deaths: Math.max(0, Math.round(value.deaths)),
    status: value.status,
  };
}

export function normalizeOutbreakData(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.outbreaks)) {
    return DEFAULT_OUTBREAK_DATA;
  }

  const outbreaks = value.outbreaks
    .map(normalizeOutbreak)
    .filter((item) => item !== null);

  if (outbreaks.length === 0) {
    return DEFAULT_OUTBREAK_DATA;
  }

  return {
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : new Date().toISOString(),
    source: typeof value.source === "string" ? value.source : "netlify-blobs",
    outbreaks,
  };
}

export async function readOutbreakData() {
  const store = getStore(OUTBREAK_STORE_NAME);
  const storedValue = await store.get(OUTBREAK_BLOB_KEY, { type: "json" });

  if (!storedValue) {
    return DEFAULT_OUTBREAK_DATA;
  }

  return normalizeOutbreakData(storedValue);
}

export async function writeOutbreakData(data) {
  const normalizedData = normalizeOutbreakData(data);
  const store = getStore(OUTBREAK_STORE_NAME);

  await store.setJSON(OUTBREAK_BLOB_KEY, normalizedData);

  return normalizedData;
}
`;
}

function generateSummaryHtml(outbreaks) {
  const sorted = {
    confirmed: [...outbreaks.filter((o) => o.status === "confirmed")].sort(
      (a, b) => b.deaths - a.deaths || b.confirmedCases - a.confirmedCases,
    ),
    suspected: [...outbreaks.filter((o) => o.status === "suspected")].sort(
      (a, b) => b.deaths - a.deaths || b.confirmedCases - a.confirmedCases,
    ),
    monitoring: [...outbreaks.filter((o) => o.status === "monitoring")].sort(
      (a, b) => a.name.localeCompare(b.name),
    ),
  };

  const totalCases = outbreaks.reduce((s, o) => s + o.confirmedCases, 0);
  const totalDeaths = outbreaks.reduce((s, o) => s + o.deaths, 0);
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const countryItem = (c) => {
    let text = c.name;
    if (c.confirmedCases > 0)
      text += ` - ${c.confirmedCases} case${c.confirmedCases !== 1 ? "s" : ""}`;
    if (c.deaths > 0)
      text += `, ${c.deaths} death${c.deaths !== 1 ? "s" : ""}`;
    return `              <li>${text}</li>`;
  };

  const lines = [
    `    <section id="outbreak-summary" aria-label="Current outbreak summary">`,
    `      <div class="outbreak-summary-inner">`,
    `        <h1>Hantavirus Outbreak 2026 - Live Global Tracker</h1>`,
    `        <p>hantamaps.com tracks the 2026 Andes hantavirus outbreak linked to the MV Hondius cruise ship. The interactive map above shows confirmed cases, suspected cases, and monitoring countries updated every 6 hours from WHO, CDC, ECDC, and national health sources.</p>`,
    `        <p class="summary-meta">Last updated: ${dateStr} &nbsp;|&nbsp; ${outbreaks.length} countries tracked &nbsp;|&nbsp; ${totalCases} confirmed cases &nbsp;|&nbsp; ${totalDeaths} deaths &nbsp;|&nbsp; <a href="/data.json">Raw data (JSON)</a></p>`,
    `        <div class="summary-groups">`,
    `          <div class="summary-group summary-confirmed">`,
    `            <h2>Confirmed Cases (${sorted.confirmed.length} countries)</h2>`,
    `            <ul>`,
    ...sorted.confirmed.map(countryItem),
    `            </ul>`,
    `          </div>`,
    `          <div class="summary-group summary-suspected">`,
    `            <h2>Suspected Cases (${sorted.suspected.length} countries)</h2>`,
    `            <ul>`,
    ...sorted.suspected.map(countryItem),
    `            </ul>`,
    `          </div>`,
    `          <div class="summary-group summary-monitoring">`,
    `            <h2>Under Monitoring (${sorted.monitoring.length} countries)</h2>`,
    `            <ul>`,
    ...sorted.monitoring.map((c) => `              <li>${c.name}</li>`),
    `            </ul>`,
    `          </div>`,
    `        </div>`,
    `        <p class="summary-sources">Data compiled from WHO, CDC, ECDC, PAHO, national health authorities, and verified news reports. <a href="/hantavirus-learn-more.html">Learn more about Andes hantavirus</a> | <a href="/hantavirus-prevention.html">Prevention guide</a></p>`,
    `      </div>`,
    `    </section>`,
  ];

  return lines.join("\n");
}

function updateSitemapLastmod(xml) {
  const today = new Date().toISOString().split("T")[0];
  return xml.replace(
    /(<loc>https:\/\/hantamaps\.com\/<\/loc>\s*<lastmod>)[^<]*/,
    `$1${today}`,
  );
}

function updateIndexHtml(html, outbreaks) {
  const START = "<!-- OUTBREAK-SUMMARY-START -->";
  const END = "<!-- OUTBREAK-SUMMARY-END -->";
  const startIdx = html.indexOf(START);
  const endIdx = html.indexOf(END);

  if (startIdx === -1 || endIdx === -1) {
    console.warn("Could not find outbreak summary markers in index.html - skipping HTML update");
    return html;
  }

  const before = html.slice(0, startIdx + START.length);
  const after = html.slice(endIdx);
  return `${before}\n${generateSummaryHtml(outbreaks)}\n    ${after}`;
}

function describeChanges(before, after) {
  const beforeByName = new Map(before.map((item) => [item.name, item]));
  const changes = [];

  for (const item of after) {
    const previous = beforeByName.get(item.name);
    if (!previous) {
      changes.push(`Added ${item.name} (${item.status}).`);
      continue;
    }

    const changedFields = ["confirmedCases", "deaths", "status"]
      .filter((field) => previous[field] !== item[field])
      .map((field) => `${field}: ${previous[field]} -> ${item[field]}`);

    if (changedFields.length > 0) {
      changes.push(`${item.name}: ${changedFields.join(", ")}`);
    }
  }

  return changes;
}

function runGit(args, options = {}) {
  return execFileSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit",
  });
}

async function main() {
  console.log("Fetching latest outbreak source text...");
  const [sourceText, existingSource] = await Promise.all([
    fetchSourceTexts(),
    readFile(dataPath, "utf8"),
  ]);

  const existingOutbreaks = parseExistingOutbreaks(existingSource);
  const { outbreaks, notes } = applySourceTextUpdates(
    existingOutbreaks,
    sourceText,
  );

  const changes = describeChanges(existingOutbreaks, outbreaks);

  console.log("\nSource notes:");
  if (notes.length === 0) {
    console.log("- No country status changes detected from source text.");
  } else {
    notes.forEach((note) => console.log(`- ${note}`));
  }

  if (changes.length === 0) {
    console.log("\nNo outbreak data changes detected.");
  } else {
    console.log("\nOutbreak data changes:");
    changes.forEach((change) => console.log(`- ${change}`));

    await mkdir(path.dirname(dataPath), { recursive: true });
    await writeFile(dataPath, formatOutbreaksFile(outbreaks), "utf8");
    await writeFile(publicDataPath, formatPublicDataFile(outbreaks), "utf8");
    await writeFile(outbreakStorePath, formatOutbreakStoreFile(outbreaks), "utf8");
    const indexHtml = await readFile(indexHtmlPath, "utf8");
    await writeFile(indexHtmlPath, updateIndexHtml(indexHtml, outbreaks), "utf8");
    const sitemap = await readFile(sitemapPath, "utf8");
    await writeFile(sitemapPath, updateSitemapLastmod(sitemap), "utf8");
  }

  if (shouldSkipGit) {
    console.log("\nSkipped Git workflow because --no-git was passed.");
    return;
  }

  console.log("\nRunning Git workflow...");
  runGit(["add", "."]);

  try {
    runGit(["diff", "--cached", "--quiet"], { quiet: true });
    console.log("No staged changes to commit or push.");
    return;
  } catch {
    runGit(["commit", "-m", "Auto update outbreak data"]);
    runGit(["push"]);
  }

  console.log("\nDone. GitHub push completed; Cloudflare Pages will redeploy automatically.");
}

main().catch((error) => {
  console.error("Auto update failed.");
  console.error(error);
  process.exitCode = 1;
});
