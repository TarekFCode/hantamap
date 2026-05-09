import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WHO_URL =
  "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "src", "data", "outbreaks.ts");

const NUMBER_WORDS = new Map([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
]);

const COUNTRY_ALIASES = new Map([
  ["Argentina", ["Argentina"]],
  ["South Africa", ["South Africa"]],
  [
    "UK",
    ["UK", "United Kingdom", "United Kingdom of Great Britain and Northern Ireland"],
  ],
  ["Netherlands", ["Netherlands", "Dutch"]],
  ["USA", ["USA", "United States", "United States of America", "American"]],
  ["Singapore", ["Singapore"]],
]);

function toNumber(value) {
  const normalized = String(value).trim().toLowerCase();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return NUMBER_WORDS.get(normalized);
}

async function fetchWhoPage() {
  const response = await fetch(WHO_URL, {
    headers: {
      "user-agent": "HantaTracker daily data updater",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch WHO page: ${response.status}`);
  }

  return response.text();
}

function htmlToText(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
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

function extractWhoGlobalTotals(text) {
  const patterns = [
    /([a-z\d]+)\s+cases?\s+\(([a-z\d]+)\s+(?:laboratory\s+)?confirmed cases?.*?([a-z\d]+)\s+suspected cases?\).*?including\s+([a-z\d]+)\s+deaths?/i,
    /total of\s+([a-z\d]+)\s+\(([a-z\d]+)\s+confirmed.*?([a-z\d]+)\s+suspected\)\s+cases?, including\s+([a-z\d]+)\s+deaths?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return {
        totalCases: toNumber(match[1]),
        confirmedCases: toNumber(match[2]),
        suspectedCases: toNumber(match[3]),
        deaths: toNumber(match[4]),
      };
    }
  }

  return null;
}

function getSentencesMentioningCountry(text, countryName) {
  const aliases = COUNTRY_ALIASES.get(countryName) ?? [countryName];
  const regexes = aliases.map(
    (alias) =>
      new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
  );

  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => regexes.some((regex) => regex.test(sentence)));
}

function extractDirectCaseCount(sentences) {
  for (const sentence of sentences) {
    const match = sentence.match(
      /([a-z\d]+)\s+(?:confirmed\s+)?cases?.*?including\s+([a-z\d]+)\s+deaths?/i,
    );

    if (match) {
      return {
        confirmedCases: toNumber(match[1]),
        deaths: toNumber(match[2]),
      };
    }
  }

  return null;
}

function applyWhoUpdates(outbreaks, whoText) {
  const notes = [];
  const whoTotals = extractWhoGlobalTotals(whoText);
  const updatedOutbreaks = outbreaks.map((outbreak) => ({ ...outbreak }));

  if (whoTotals) {
    notes.push(
      `WHO global totals: ${whoTotals.totalCases} total, ${whoTotals.confirmedCases} confirmed, ${whoTotals.suspectedCases} suspected, ${whoTotals.deaths} deaths.`,
    );
  } else {
    notes.push("WHO global totals not found.");
  }

  for (const outbreak of updatedOutbreaks) {
    const directCount = extractDirectCaseCount(
      getSentencesMentioningCountry(whoText, outbreak.name),
    );

    if (directCount?.confirmedCases !== undefined) {
      outbreak.confirmedCases = directCount.confirmedCases;
      outbreak.deaths = directCount.deaths ?? outbreak.deaths;
      outbreak.status =
        outbreak.confirmedCases > 0 ? "confirmed" : outbreak.status;
      notes.push(
        `${outbreak.name}: direct WHO count set to ${outbreak.confirmedCases} cases and ${outbreak.deaths} deaths.`,
      );
      continue;
    }

    if (outbreak.name === "South Africa") {
      let confirmedCases = 0;
      let deaths = 0;

      if (
        /laboratory testing conducted in South Africa confirmed hantavirus infection in one patient/i.test(
          whoText,
        )
      ) {
        confirmedCases += 1;
      }

      if (
        /flight to Johannesburg, South Africa.*?died.*?confirmed by PCR with hantavirus infection/i.test(
          whoText,
        )
      ) {
        confirmedCases += 1;
        deaths += 1;
      }

      if (confirmedCases > 0) {
        outbreak.confirmedCases = confirmedCases;
        outbreak.deaths = deaths;
        outbreak.status = "confirmed";
        notes.push(
          `South Africa: WHO case narrative set to ${confirmedCases} cases and ${deaths} deaths.`,
        );
        continue;
      }
    }

    notes.push(`No direct WHO per-country update found for ${outbreak.name}.`);
  }

  return {
    outbreaks: updatedOutbreaks,
    notes,
  };
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
      changes.push(`Added ${item.name}.`);
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
  console.log("Fetching latest WHO outbreak page...");
  const [whoHtml, existingSource] = await Promise.all([
    fetchWhoPage(),
    readFile(dataPath, "utf8"),
  ]);

  const existingOutbreaks = parseExistingOutbreaks(existingSource);
  const { outbreaks, notes } = applyWhoUpdates(
    existingOutbreaks,
    htmlToText(whoHtml),
  );

  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, formatOutbreaksFile(outbreaks), "utf8");

  const changes = describeChanges(existingOutbreaks, outbreaks);

  console.log("\nSource notes:");
  notes.forEach((note) => console.log(`- ${note}`));

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
