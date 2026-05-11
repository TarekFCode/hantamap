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
