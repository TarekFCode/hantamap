import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applySourceTextUpdates } from "../netlify/shared/outbreak-classifier.js";

const WHO_URL =
  "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599";
const GNEWS_API_URL = "https://gnews.io/api/v4/search";
const GNEWS_TOKEN =
  process.env.VITE_GNEWS_TOKEN || "7b454d1d6f7bef8d61635031d356507f";
const NEWS_QUERIES = [
  "hantavirus MV Hondius countries monitoring",
  "hantavirus cruise ship confirmed suspected countries",
  "Andes virus Hondius contact tracing passengers",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "src", "data", "outbreaks.ts");

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

async function fetchWhoText() {
  return htmlToText(await fetchText(WHO_URL, "HantaTracker daily data updater"));
}

async function fetchGNewsText() {
  if (!GNEWS_TOKEN || GNEWS_TOKEN === "YOUR_GNEWS_TOKEN") {
    return "";
  }

  const articleTexts = [];

  for (const query of NEWS_QUERIES) {
    const url = new URL(GNEWS_API_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("lang", "en");
    url.searchParams.set("max", "10");
    url.searchParams.set("token", GNEWS_TOKEN);

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        console.warn(
          `GNews query failed for "${query}": ${data.message ?? response.status}`,
        );
        continue;
      }

      for (const article of data.articles ?? []) {
        articleTexts.push(
          [article.title, article.description, article.content]
            .filter(Boolean)
            .join(". "),
        );
      }
    } catch (error) {
      console.warn(`GNews query failed for "${query}":`, error);
    }
  }

  return articleTexts.join(" ");
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
  console.log("Fetching latest WHO and GNews source text...");
  const [whoText, gnewsText, existingSource] = await Promise.all([
    fetchWhoText(),
    fetchGNewsText(),
    readFile(dataPath, "utf8"),
  ]);

  const sourceText = `${whoText} ${gnewsText}`.replace(/\s+/g, " ").trim();
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
