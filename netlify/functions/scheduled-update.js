import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { applySourceTextUpdates } from "../shared/outbreak-classifier.js";
import { readOutbreakData, writeOutbreakData } from "../shared/outbreak-store.js";

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
    const [currentData, whoText, gnewsText] = await Promise.all([
      readOutbreakData(),
      fetchWhoText(),
      fetchGNewsText(),
    ]);
    const { outbreaks: nextOutbreaks, notes } = applySourceTextUpdates(
      currentData.outbreaks,
      `${whoText} ${gnewsText}`,
    );

    notes.forEach((note) => console.log(note));

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
