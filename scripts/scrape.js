import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WHO_URL =
  "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599";
const CDC_URL = "https://www.cdc.gov/hantavirus/situation-summary/index.html";

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

function toNumber(value) {
  const normalized = String(value).trim().toLowerCase();
  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return NUMBER_WORDS.get(normalized);
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "HantaTracker outbreak data updater",
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

function extractWhoTotals(text) {
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

function summarizeCountryMentions(text, aliases) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const mentionRegexes = aliases.map(
    (alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
  );

  return sentences.filter((sentence) =>
    mentionRegexes.some((regex) => regex.test(sentence)),
  );
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

function applySourceUpdates(outbreaks, whoText, cdcText) {
  const updates = new Map(outbreaks.map((item) => [item.name, { ...item }]));
  const notes = [];

  const whoTotals = extractWhoTotals(whoText);
  if (whoTotals) {
    notes.push(
      `WHO global totals: ${whoTotals.totalCases} total cases, ${whoTotals.confirmedCases} confirmed, ${whoTotals.suspectedCases} suspected, ${whoTotals.deaths} deaths.`,
    );
  } else {
    notes.push("WHO global totals: not found.");
  }

  const usa = updates.get("USA");
  if (
    usa &&
    /no cases of Andes virus have been reported in the United States/i.test(
      cdcText,
    )
  ) {
    usa.confirmedCases = 0;
    usa.deaths = 0;
    usa.status = "monitoring";
    notes.push("CDC country update: USA remains 0 cases and 0 deaths.");
  }

  const southAfrica = updates.get("South Africa");
  if (southAfrica) {
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
      southAfrica.confirmedCases = confirmedCases;
      southAfrica.deaths = deaths;
      southAfrica.status = "confirmed";
      notes.push(
        `WHO country update: South Africa set to ${confirmedCases} confirmed cases and ${deaths} deaths from case narratives.`,
      );
    }
  }

  const aliasByCountry = new Map([
    ["Argentina", ["Argentina"]],
    ["South Africa", ["South Africa"]],
    [
      "UK",
      ["United Kingdom", "United Kingdom of Great Britain and Northern Ireland"],
    ],
    ["Netherlands", ["Netherlands", "Dutch"]],
    ["USA", ["United States", "U.S.", "American"]],
    ["Singapore", ["Singapore"]],
  ]);

  for (const outbreak of updates.values()) {
    const aliases = aliasByCountry.get(outbreak.name) ?? [outbreak.name];
    const sentences = [
      ...summarizeCountryMentions(whoText, aliases),
      ...summarizeCountryMentions(cdcText, aliases),
    ];
    const directCount = extractDirectCaseCount(sentences);

    if (directCount) {
      outbreak.confirmedCases = directCount.confirmedCases ?? outbreak.confirmedCases;
      outbreak.deaths = directCount.deaths ?? outbreak.deaths;
      notes.push(
        `Direct country sentence update: ${outbreak.name} set to ${outbreak.confirmedCases} cases and ${outbreak.deaths} deaths.`,
      );
    } else if (outbreak.name !== "USA" && outbreak.name !== "South Africa") {
      notes.push(
        `No direct per-country count found for ${outbreak.name}; kept existing values.`,
      );
    }
  }

  return {
    outbreaks: outbreaks.map((item) => updates.get(item.name) ?? item),
    notes,
  };
}

function formatOutbreaksFile(outbreaks) {
  const entries = outbreaks
    .map(
      (item) => `  {
    name: "${item.name}",
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

    const fields = ["confirmedCases", "deaths", "status"];
    const changedFields = fields
      .filter((field) => previous[field] !== item[field])
      .map((field) => `${field}: ${previous[field]} -> ${item[field]}`);

    if (changedFields.length > 0) {
      changes.push(`${item.name}: ${changedFields.join(", ")}`);
    }
  }

  return changes;
}

async function main() {
  console.log("Fetching WHO and CDC outbreak pages...");
  const [whoHtml, cdcHtml, existingSource] = await Promise.all([
    fetchPage(WHO_URL),
    fetchPage(CDC_URL),
    readFile(dataPath, "utf8"),
  ]);

  const whoText = htmlToText(whoHtml);
  const cdcText = htmlToText(cdcHtml);
  const existingOutbreaks = parseExistingOutbreaks(existingSource);
  const { outbreaks, notes } = applySourceUpdates(
    existingOutbreaks,
    whoText,
    cdcText,
  );

  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, formatOutbreaksFile(outbreaks), "utf8");

  const changes = describeChanges(existingOutbreaks, outbreaks);

  console.log("\nSource notes:");
  notes.forEach((note) => console.log(`- ${note}`));

  console.log("\nUpdated src/data/outbreaks.ts");
  if (changes.length === 0) {
    console.log("No data changes detected.");
    return;
  }

  console.log("Changes:");
  changes.forEach((change) => console.log(`- ${change}`));
}

main().catch((error) => {
  console.error("Failed to update outbreak data.");
  console.error(error);
  process.exitCode = 1;
});
