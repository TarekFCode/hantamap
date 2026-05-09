import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { readOutbreakData, writeOutbreakData } from "../shared/outbreak-store.js";

const WHO_URL =
  "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599";

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

function htmlToText(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
}

async function fetchWhoText() {
  const response = await fetch(WHO_URL, {
    headers: {
      "user-agent": "HantaTracker Netlify scheduled update",
    },
  });

  if (!response.ok) {
    throw new Error(`WHO fetch failed: ${response.status}`);
  }

  return htmlToText(await response.text());
}

function updateOutbreaksFromWho(outbreaks, whoText) {
  return outbreaks.map((outbreak) => {
    if (outbreak.name !== "South Africa") {
      return outbreak;
    }

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

    if (confirmedCases === 0) {
      return outbreak;
    }

    return {
      ...outbreak,
      confirmedCases,
      deaths,
      status: "confirmed",
    };
  });
}

function hasOutbreakChanges(previousOutbreaks, nextOutbreaks) {
  return JSON.stringify(previousOutbreaks) !== JSON.stringify(nextOutbreaks);
}

async function triggerBuildHook() {
  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;

  if (!buildHookUrl) {
    console.log("NETLIFY_BUILD_HOOK_URL is not set; skipping redeploy trigger.");
    return;
  }

  const response = await fetch(buildHookUrl, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Build hook failed: ${response.status}`);
  }

  console.log("Triggered Netlify build hook.");
}

export default async () => {
  try {
    const [currentData, whoText] = await Promise.all([
      readOutbreakData(),
      fetchWhoText(),
    ]);
    const nextOutbreaks = updateOutbreaksFromWho(currentData.outbreaks, whoText);

    if (!hasOutbreakChanges(currentData.outbreaks, nextOutbreaks)) {
      console.log("No WHO outbreak data changes found.");
      return new Response(null, { status: 204 });
    }

    const nextData = await writeOutbreakData({
      updatedAt: new Date().toISOString(),
      source: WHO_URL,
      outbreaks: nextOutbreaks,
    });

    console.log("Updated outbreak data:", nextData);
    await triggerBuildHook();

    return Response.json(nextData);
  } catch (error) {
    console.error("Scheduled outbreak update failed:", error);

    return Response.json(
      {
        error: "Scheduled outbreak update failed",
      },
      {
        status: 500,
      },
    );
  }
};
