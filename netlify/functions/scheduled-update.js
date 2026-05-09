import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { applySourceTextUpdates } from "../shared/outbreak-classifier.js";
import { readOutbreakData, writeOutbreakData } from "../shared/outbreak-store.js";

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
function htmlToText(html) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
}

async function fetchSourceTexts() {
  const results = await Promise.allSettled(
    SOURCE_URLS.map(async (url) => {
      const response = await fetch(url, {
        headers: {
          "user-agent": "HantaTracker Netlify scheduled update",
        },
      });

      if (!response.ok) {
        throw new Error(`${url} fetch failed: ${response.status}`);
      }

      return htmlToText(await response.text());
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
    const [currentData, sourceText] = await Promise.all([
      readOutbreakData(),
      fetchSourceTexts(),
    ]);
    const { outbreaks: nextOutbreaks, notes } = applySourceTextUpdates(
      currentData.outbreaks,
      sourceText,
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
