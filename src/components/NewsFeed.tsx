import { useEffect, useState } from "react";
import { SupportedLanguage, translateText } from "../i18n";

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
  "rodent-borne virus outbreak",
];
const OFFICIAL_SOURCE_ARTICLES: NewsArticle[] = [
  {
    title:
      "WHO Disease Outbreak News: Hantavirus cluster linked to cruise ship travel",
    url: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599",
    publishedAt: "2026-05-04T00:00:00Z",
    source: {
      name: "World Health Organization",
    },
  },
  {
    title: "CDC Hantavirus Situation Summary",
    url: "https://www.cdc.gov/hantavirus/situation-summary/index.html",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "CDC",
    },
  },
  {
    title: "CDC Hantavirus Information",
    url: "https://www.cdc.gov/hantavirus/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "CDC",
    },
  },
  {
    title: "European CDC Communicable Disease Threats and Updates",
    url: "https://www.ecdc.europa.eu/en/all-topics-z/communicable-disease-threats-reports",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "ECDC",
    },
  },
  {
    title: "PAHO Hantavirus Disease Information",
    url: "https://www.paho.org/en/topics/hantavirus",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "PAHO",
    },
  },
  {
    title: "Argentina Ministry of Health",
    url: "https://www.argentina.gob.ar/salud",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "Argentina Ministry of Health",
    },
  },
  {
    title: "South Africa National Institute for Communicable Diseases",
    url: "https://www.nicd.ac.za/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "NICD South Africa",
    },
  },
  {
    title: "UK Health Security Agency News",
    url: "https://www.gov.uk/government/organisations/uk-health-security-agency",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "UKHSA",
    },
  },
  {
    title: "Netherlands National Institute for Public Health and the Environment",
    url: "https://www.rivm.nl/en",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "RIVM",
    },
  },
  {
    title: "Singapore Ministry of Health Updates",
    url: "https://www.moh.gov.sg/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "Singapore MOH",
    },
  },
  {
    title: "ReliefWeb Hantavirus Search",
    url: "https://reliefweb.int/updates?search=hantavirus",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "ReliefWeb",
    },
  },
  {
    title: "ProMED Hantavirus Reports",
    url: "https://promedmail.org/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "ProMED",
    },
  },
  {
    title: "Outbreak News Today Hantavirus Search",
    url: "https://outbreaknewstoday.com/?s=hantavirus",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "Outbreak News Today",
    },
  },
  {
    title: "CIDRAP Infectious Disease News",
    url: "https://www.cidrap.umn.edu/news-perspective",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "CIDRAP",
    },
  },
  {
    title: "Reuters Health News",
    url: "https://www.reuters.com/business/healthcare-pharmaceuticals/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "Reuters",
    },
  },
  {
    title: "AP Health News",
    url: "https://apnews.com/hub/health",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "Associated Press",
    },
  },
  {
    title: "STAT Health News",
    url: "https://www.statnews.com/",
    publishedAt: "2026-05-08T00:00:00Z",
    source: {
      name: "STAT",
    },
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

  if (daysAgo <= 1) {
    return "LIVE";
  }

  if (daysAgo > 0) {
    return `${daysAgo}d ago`;
  }

  if (hoursAgo > 0) {
    return `${hoursAgo}h ago`;
  }

  if (minutesAgo > 0) {
    return `${minutesAgo}m ago`;
  }

  return "Just now";
}

function dedupeAndSortArticles(articles: NewsArticle[]): NewsArticle[] {
  const byUrl = new Map<string, NewsArticle>();

  for (const article of articles) {
    if (!article.url || byUrl.has(article.url)) {
      continue;
    }

    byUrl.set(article.url, article);
  }

  return [...byUrl.values()].sort(
    (first, second) =>
      new Date(second.publishedAt).getTime() -
      new Date(first.publishedAt).getTime(),
  );
}

const UI_COPY = {
  title: "Live News Feed",
  sources: "Sources",
  loading: "Fetching latest reports",
  empty: "No articles found",
  unknownSource: "Unknown source",
  justNow: "Just now",
};

export default function NewsFeed({ language }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string>>({});
  const [translatedCopy, setTranslatedCopy] = useState(UI_COPY);

  useEffect(() => {
    let isMounted = true;
    let activeController: AbortController | null = null;

    const fetchArticles = async () => {
      const fallbackArticles = dedupeAndSortArticles(OFFICIAL_SOURCE_ARTICLES).slice(
        0,
        24,
      );

      if (!GNEWS_TOKEN || GNEWS_TOKEN === "YOUR_GNEWS_TOKEN") {
        console.error("GNews token is missing.");
        if (isMounted) {
          setArticles(fallbackArticles);
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
            url.searchParams.set("lang", "en");
            url.searchParams.set("max", "10");
            url.searchParams.set("token", GNEWS_TOKEN);

            const response = await fetch(url.toString(), {
              signal: activeController?.signal,
            });
            const responseText = await response.text();
            let data: GNewsApiResponse = {};

            try {
              data = JSON.parse(responseText) as GNewsApiResponse;
            } catch (error) {
              console.error("GNews response was not JSON:", {
                query,
                error,
                responseText,
              });
            }

            console.log("GNews fetch response:", {
              query,
              requestUrl: url.toString(),
              status: response.status,
              ok: response.ok,
              responseText,
              data,
            });

            if (!response.ok) {
              console.error(
                "GNews query failed:",
                data.message ||
                  data.errors?.join(", ") ||
                  `GNews request failed: ${response.status}`,
              );
              return [];
            }

            return data.articles ?? [];
          }),
        );

        const gnewsArticles = responses.flatMap((result) =>
          result.status === "fulfilled" ? result.value : [],
        );
        const combinedArticles = dedupeAndSortArticles([
          ...gnewsArticles,
          ...OFFICIAL_SOURCE_ARTICLES,
        ]);

        if (isMounted) {
          setArticles(combinedArticles.slice(0, 24));
        }
      } catch (error) {
        if (
          isMounted &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          console.error("GNews fetch error:", error);
          setArticles(fallbackArticles);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchArticles();
    const intervalId = window.setInterval(fetchArticles, FIVE_MINUTES_MS);

    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const translateArticles = async () => {
      if (language === "en") {
        setTranslatedTitles({});
        setTranslatedCopy(UI_COPY);
        return;
      }

      const nextTitles: Record<string, string> = {};

      for (const article of articles) {
        const key = `${article.url}-${article.title}`;
        nextTitles[key] = await translateText(article.title, language);
      }

      const nextCopy = {
        title: await translateText(UI_COPY.title, language),
        sources: await translateText(UI_COPY.sources, language),
        loading: await translateText(UI_COPY.loading, language),
        empty: await translateText(UI_COPY.empty, language),
        unknownSource: await translateText(UI_COPY.unknownSource, language),
        justNow: await translateText(UI_COPY.justNow, language),
      };

      if (isMounted) {
        setTranslatedTitles(nextTitles);
        setTranslatedCopy(nextCopy);
      }
    };

    void translateArticles();

    return () => {
      isMounted = false;
    };
  }, [articles, language]);

  return (
    <aside
      className="news-feed"
      aria-label="Live hantavirus news"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="news-feed-header">
        <p>{translatedCopy.title}</p>
        <span>{translatedCopy.sources}</span>
      </div>

      {isLoading ? (
        <div className="news-loading" role="status" aria-live="polite">
          <span className="news-spinner" />
          <p>{translatedCopy.loading}</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="news-list">
          {articles.map((article) => {
            const articleKey = `${article.url}-${article.title}`;

            return (
            <article className="news-item" key={articleKey}>
              <a href={article.url} target="_blank" rel="noreferrer">
                {translatedTitles[articleKey] ?? article.title}
              </a>
              <div className="news-meta">
                <span>{article.source.name || translatedCopy.unknownSource}</span>
                <span>
                  {formatTimeAgo(article.publishedAt) === "Just now"
                    ? translatedCopy.justNow
                    : formatTimeAgo(article.publishedAt)}
                </span>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <p className="news-empty">{translatedCopy.empty}</p>
      )}
    </aside>
  );
}
