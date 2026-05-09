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

  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, formatOutbreaksFile(outbreaks), "utf8");

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

  console.log("\nDone. GitHub push completed; Netlify should redeploy automatically.");
}

main().catch((error) => {
  console.error("Auto update failed.");
  console.error(error);
  process.exitCode = 1;
});
