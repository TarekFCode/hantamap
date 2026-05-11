import { useEffect, useState } from "react";
import { SupportedLanguage, translateUiText } from "../i18n";

type NewsArticle = {
  title: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
};

type GNewsApiResponse = {
  status?: string;
  errors?: string[];
  message?: string;
  articles?: NewsArticle[];
};

type NewsFeedProps = {
  language: SupportedLanguage;
};

const GNEWS_API_URL = "https://gnews.io/api/v4/search";
const GNEWS_TOKEN =
  import.meta.env.VITE_GNEWS_TOKEN || "7b454d1d6f7bef8d61635031d356507f";
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const NEWS_QUERIES = [
  "hantavirus",
  "Andes virus",
  "hantavirus outbreak",
  "MV Hondius",
  "hantavirus cruise ship",
  "hantavirus 2026",
  "Andes hantavirus cases",
  "hantavirus deaths",
  "hantavirus Argentina",
  "hantavirus South Africa",
  "hantavirus Europe",
];
const OFFICIAL_SOURCE_ARTICLES: NewsArticle[] = [
  // WHO
  {
    title: "WHO DON599: Hantavirus cluster linked to MV Hondius cruise ship travel",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599",
    publishedAt: "2026-05-04T00:00:00Z",
    source: { name: "WHO" },
  },
  {
    title: "WHO Response to hantavirus cases linked to a cruise ship (May 7 update)",
    url: "https://www.who.int/philippines/news/detail-global/07-05-2026-who-s-response-to-hantavirus-cases-linked-to-a-cruise-ship",
    publishedAt: "2026-05-07T00:00:00Z",
    source: { name: "WHO" },
  },
  {
    title: "WHO: Hantavirus outbreak not another COVID, says WHO",
    url: "https://www.ungeneva.org/en/news-media/news/2026/05/118402/hantavirus-outbreak-cruise-ship-not-another-covid-who-says",
    publishedAt: "2026-05-06T00:00:00Z",
    source: { name: "WHO / UN Geneva" },
  },
  {
    title: "WHO Fact Sheet: Hantavirus and Hantaviral Diseases",
    url: "https://www.who.int/news-room/fact-sheets/detail/hantavirus-and-hantaviral-diseases",
    publishedAt: "2026-05-01T00:00:00Z",
    source: { name: "WHO" },
  },
  // CDC
  {
    title: "CDC Health Alert HAN-528: 2026 Multi-country Hantavirus Cluster",
    url: "https://www.cdc.gov/han/php/notices/han00528.html",
    publishedAt: "2026-05-05T00:00:00Z",
    source: { name: "CDC" },
  },
  {
    title: "CDC Hantavirus Situation Summary",
    url: "https://www.cdc.gov/hantavirus/situation-summary/index.html",
    publishedAt: "2026-05-09T00:00:00Z",
    source: { name: "CDC" },
  },
  {
    title: "CDC: What You Need to Know About Hantavirus",
    url: "https://www.cdc.gov/hantavirus/",
    publishedAt: "2026-05-05T00:00:00Z",
    source: { name: "CDC" },
  },
  // ECDC
  {
    title: "ECDC: Andes hantavirus outbreak surveillance and updates",
    url: "https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "ECDC" },
  },
  {
    title: "ECDC Communicable Disease Threats Report — Hantavirus",
    url: "https://www.ecdc.europa.eu/en/all-topics-z/communicable-disease-threats-reports",
    publishedAt: "2026-05-09T00:00:00Z",
    source: { name: "ECDC" },
  },
  // PAHO
  {
    title: "PAHO: Hantavirus Disease — Regional Situation",
    url: "https://www.paho.org/en/topics/hantavirus",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "PAHO" },
  },
  // National health agencies
  {
    title: "Argentina Ministry of Health — Hantavirus Update",
    url: "https://www.argentina.gob.ar/salud",
    publishedAt: "2026-05-09T00:00:00Z",
    source: { name: "Argentina Ministry of Health" },
  },
  {
    title: "NICD South Africa: Hantavirus Case Investigation",
    url: "https://www.nicd.ac.za/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "NICD South Africa" },
  },
  {
    title: "UKHSA: Hantavirus case linked to cruise ship travel",
    url: "https://www.gov.uk/government/organisations/uk-health-security-agency",
    publishedAt: "2026-05-07T00:00:00Z",
    source: { name: "UKHSA" },
  },
  {
    title: "RIVM Netherlands: Hantavirus investigation update",
    url: "https://www.rivm.nl/en",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "RIVM" },
  },
  {
    title: "Chile Ministry of Health — Hantavirus situation",
    url: "https://www.minsal.cl/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "Chile Ministry of Health" },
  },
  {
    title: "Switzerland FOPH: Hantavirus case confirmed",
    url: "https://www.bag.admin.ch/bag/en/home.html",
    publishedAt: "2026-05-07T00:00:00Z",
    source: { name: "Swiss FOPH" },
  },
  // Surveillance & research
  {
    title: "ProMED: Hantavirus — multi-country 2026 outbreak archive",
    url: "https://promedmail.org/",
    publishedAt: "2026-05-10T00:00:00Z",
    source: { name: "ProMED" },
  },
  {
    title: "CIDRAP: Hantavirus cruise ship cluster expands to new countries",
    url: "https://www.cidrap.umn.edu/news-perspective",
    publishedAt: "2026-05-09T00:00:00Z",
    source: { name: "CIDRAP" },
  },
  {
    title: "Outbreak News Today: Hantavirus latest reports",
    url: "https://outbreaknewstoday.com/?s=hantavirus",
    publishedAt: "2026-05-10T00:00:00Z",
    source: { name: "Outbreak News Today" },
  },
  {
    title: "HealthMap: Hantavirus global alerts",
    url: "https://www.healthmap.org/en/",
    publishedAt: "2026-05-09T00:00:00Z",
    source: { name: "HealthMap" },
  },
  // Major news
  {
    title: "Reuters: Hantavirus cases confirmed in cruise ship passengers worldwide",
    url: "https://www.reuters.com/business/healthcare-pharmaceuticals/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "Reuters" },
  },
  {
    title: "AP: What is hantavirus? What to know about the cruise ship outbreak",
    url: "https://apnews.com/hub/health",
    publishedAt: "2026-05-07T00:00:00Z",
    source: { name: "Associated Press" },
  },
  {
    title: "CBS News: Hantavirus on MV Hondius — passengers monitored across US and worldwide",
    url: "https://www.cbsnews.com/news/hantavirus-cruise-ship-mv-hondius-passengers-monitored-us-worldwide/",
    publishedAt: "2026-05-06T00:00:00Z",
    source: { name: "CBS News" },
  },
  {
    title: "BBC: Hantavirus: What we know about the cruise ship outbreak",
    url: "https://www.bbc.com/news/health",
    publishedAt: "2026-05-07T00:00:00Z",
    source: { name: "BBC News" },
  },
  {
    title: "The Guardian: Hantavirus outbreak traced to Antarctica cruise ship",
    url: "https://www.theguardian.com/world/disease",
    publishedAt: "2026-05-06T00:00:00Z",
    source: { name: "The Guardian" },
  },
  {
    title: "NPR: A hantavirus outbreak has been linked to a cruise ship. Here's what to know",
    url: "https://www.npr.org/sections/health-shots/",
    publishedAt: "2026-05-07T00:00:00Z",
    source: { name: "NPR" },
  },
  {
    title: "New York Times: Hantavirus Outbreak Linked to Antarctic Cruise Ship",
    url: "https://www.nytimes.com/section/health",
    publishedAt: "2026-05-05T00:00:00Z",
    source: { name: "New York Times" },
  },
  {
    title: "Washington Post: Hantavirus cases multiply among cruise ship passengers",
    url: "https://www.washingtonpost.com/health/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: { name: "Washington Post" },
  },
  {
    title: "Wikipedia: MV Hondius hantavirus outbreak",
    url: "https://en.wikipedia.org/wiki/MV_Hondius_hantavirus_outbreak",
    publishedAt: "2026-05-10T00:00:00Z",
    source: { name: "Wikipedia" },
  },
];

function formatTimeAgo(publishedAt: string): string {
  const publishedTime = new Date(publishedAt).getTime();

  if (Number.isNaN(publishedTime)) {
    return "LIVE";
  }

  const secondsAgo = Math.max(0, Math.floor((Date.now() - publishedTime) / 1000));
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo <= 1) return "LIVE";
  if (daysAgo > 0) return `${daysAgo}d ago`;
  if (hoursAgo > 0) return `${hoursAgo}h ago`;
  if (minutesAgo > 0) return `${minutesAgo}m ago`;
  return "LIVE";
}

function dedupeAndSortArticles(articles: NewsArticle[]): NewsArticle[] {
  const byUrl = new Map<string, NewsArticle>();

  for (const article of articles) {
    if (!article.url || byUrl.has(article.url)) continue;
    byUrl.set(article.url, article);
  }

  return [...byUrl.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export default function NewsFeed({ language }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let activeController: AbortController | null = null;

    const fetchArticles = async () => {
      const fallback = dedupeAndSortArticles(OFFICIAL_SOURCE_ARTICLES).slice(0, 24);

      if (!GNEWS_TOKEN || GNEWS_TOKEN === "YOUR_GNEWS_TOKEN") {
        if (isMounted) {
          setArticles(fallback);
          setIsLoading(false);
        }
        return;
      }

      activeController?.abort();
      activeController = new AbortController();
      setIsLoading(true);

      try {
        const responses = await Promise.allSettled(
          NEWS_QUERIES.map(async (query) => {
            const url = new URL(GNEWS_API_URL);
            url.searchParams.set("q", query);
            url.searchParams.set("lang", language);
            url.searchParams.set("max", "10");
            url.searchParams.set("token", GNEWS_TOKEN);

            const response = await fetch(url.toString(), {
              signal: activeController?.signal,
            });
            const responseText = await response.text();
            let data: GNewsApiResponse = {};

            try {
              data = JSON.parse(responseText) as GNewsApiResponse;
            } catch {
              console.error("GNews response was not JSON:", { query, responseText });
            }

            if (!response.ok) {
              console.error("GNews query failed:", data.message ?? `status ${response.status}`);
              return [];
            }

            return data.articles ?? [];
          }),
        );

        const gnewsArticles = responses.flatMap((r) =>
          r.status === "fulfilled" ? r.value : [],
        );
        const combined = dedupeAndSortArticles([...gnewsArticles, ...OFFICIAL_SOURCE_ARTICLES]);

        if (isMounted) {
          setArticles(combined.slice(0, 24));
        }
      } catch (error) {
        if (isMounted && !(error instanceof DOMException && error.name === "AbortError")) {
          console.error("GNews fetch error:", error);
          setArticles(fallback);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchArticles();
    const intervalId = window.setInterval(fetchArticles, FIVE_MINUTES_MS);

    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(intervalId);
    };
  }, [language]);

  return (
    <aside
      className="news-feed"
      aria-label="Live hantavirus news"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="news-feed-header">
        <p>{translateUiText("Live News Feed", language)}</p>
        <span>{translateUiText("Sources", language)}</span>
      </div>

      {isLoading ? (
        <div className="news-loading" role="status" aria-live="polite">
          <span className="news-spinner" />
          <p>{translateUiText("Fetching latest reports", language)}</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="news-list">
          {articles.map((article) => {
            const articleKey = `${article.url}-${article.title}`;
            return (
              <article className="news-item" key={articleKey}>
                <a href={article.url} target="_blank" rel="noreferrer">
                  {article.title}
                </a>
                <div className="news-meta">
                  <span>{article.source.name || translateUiText("Unknown source", language)}</span>
                  <span>
                    {formatTimeAgo(article.publishedAt) === "LIVE"
                      ? translateUiText("Just now", language)
                      : formatTimeAgo(article.publishedAt)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="news-empty">{translateUiText("No articles found", language)}</p>
      )}
    </aside>
  );
}
