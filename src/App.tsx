import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import Admin from "./components/Admin";
import LanguageSelector from "./components/LanguageSelector";
import NewsFeed from "./components/NewsFeed";
import { OutbreakDataPoint, OutbreakStatus } from "./data/outbreaks";
import {
  fetchSharedOutbreaks,
  getLastUpdated,
  loadOutbreaks,
  OUTBREAK_STORAGE_EVENT,
  OUTBREAK_STORAGE_KEY,
} from "./data/outbreakStorage";
import {
  detectLanguage,
  getSavedLanguage,
  SupportedLanguage,
  translateUiText,
} from "./i18n";

const STYLE_URL = "https://demotiles.maplibre.org/globe.json";

const TICKER_TEXT: Record<SupportedLanguage, string> = {
  en: "SOURCE: WHO • Last updated May 9 2026 • MV Hondius cruise ship outbreak • Andes virus confirmed • Global risk: LOW per WHO • Stay informed •",
  de: "QUELLE: WHO • Zuletzt aktualisiert 9. Mai 2026 • MV Hondius Kreuzfahrtschiff-Ausbruch • Andes-Virus bestätigt • Globales Risiko: NIEDRIG laut WHO • Informiert bleiben •",
  fr: "SOURCE : OMS • Dernière mise à jour 9 mai 2026 • Épidémie sur le MV Hondius • Virus Andes confirmé • Risque mondial : FAIBLE selon l'OMS • Restez informé •",
  es: "FUENTE: OMS • Última actualización 9 mayo 2026 • Brote del crucero MV Hondius • Virus Andes confirmado • Riesgo global: BAJO según OMS • Manténgase informado •",
  pt: "FONTE: OMS • Última atualização 9 maio 2026 • Surto do cruzeiro MV Hondius • Vírus Andes confirmado • Risco global: BAIXO segundo OMS • Mantenha-se informado •",
  nl: "BRON: WHO • Laatste update 9 mei 2026 • MV Hondius cruiseschip uitbraak • Andenvirus bevestigd • Wereldrisico: LAAG volgens WHO • Blijf op de hoogte •",
  ru: "ИСТОЧНИК: ВОЗ • Последнее обновление 9 мая 2026 • Вспышка на MV Hondius • Вирус Андес подтверждён • Глобальный риск: НИЗКИЙ (ВОЗ) • Будьте в курсе •",
  ja: "情報源：WHO • 最終更新：2026年5月9日 • MV ホンディウス客船アウトブレイク • アンデスウイルス確認 • 世界リスク：低（WHO） • 最新情報をご確認ください •",
  ko: "출처: WHO • 최종 업데이트: 2026년 5월 9일 • MV 혼디우스 크루즈선 발생 • 안데스 바이러스 확인 • 세계 위험도: 낮음 (WHO) • 최신 정보를 확인하세요 •",
  ar: "المصدر: منظمة الصحة العالمية • آخر تحديث 9 مايو 2026 • فاشية السفينة MV Hondius • فيروس الأنديز مؤكد • المخاطرة العالمية: منخفضة (منظمة الصحة العالمية) • ابقَ على اطلاع •",
};
const COUNTRIES_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
const OCEAN_GLOBE_POLYGON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
          ],
        ],
      },
    },
  ],
} as const;

const COUNTRY_NAME_EXPRESSION = [
  "coalesce",
  ["get", "ADMIN"],
  ["get", "name"],
  ["get", "NAME"],
  ["get", "NAME_EN"],
  ["get", "SOVEREIGNT"],
] as const;

function createOutbreaksGeoJson(outbreaks: OutbreakDataPoint[]) {
  return {
    type: "FeatureCollection",
    features: outbreaks.map((outbreak) => ({
    type: "Feature",
    properties: {
      name: outbreak.name,
      confirmedCases: outbreak.confirmedCases,
      deaths: outbreak.deaths,
      status: outbreak.status,
    },
    geometry: {
      type: "Point",
      coordinates: [outbreak.longitude, outbreak.latitude],
    },
  })),
  } as const;
}

function getCountryAliases(name: string): string[] {
  if (name === "UK") {
    return [
      "UK",
      "United Kingdom",
      "United Kingdom of Great Britain and Northern Ireland",
    ];
  }

  if (name === "USA") {
    return ["USA", "US", "U.S.", "United States", "United States of America"];
  }

  if (name === "Turkey") {
    return ["Turkey", "Türkiye"];
  }

  if (name === "Saint Kitts and Nevis") {
    return ["Saint Kitts and Nevis", "St Kitts and Nevis", "St. Kitts and Nevis"];
  }

  return [name];
}

function getCountryNamesByStatus(
  outbreaks: OutbreakDataPoint[],
  status: OutbreakStatus,
): string[] {
  return outbreaks
    .filter((outbreak) => outbreak.status === status)
    .flatMap((outbreak) => getCountryAliases(outbreak.name));
}

function createStatusFillColorExpression(outbreaks: OutbreakDataPoint[]) {
  return [
    "case",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "confirmed")],
    ],
    "#e53935",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "suspected")],
    ],
    "#f59e0b",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "monitoring")],
    ],
    "#8b5cf6",
    "rgba(0, 0, 0, 0)",
  ];
}

function createStatusFillOpacityExpression(outbreaks: OutbreakDataPoint[]) {
  return [
    "case",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "confirmed")],
    ],
    0.72,
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "suspected")],
    ],
    0.72,
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "monitoring")],
    ],
    0.62,
    0,
  ];
}

function createStatusLineColorExpression(outbreaks: OutbreakDataPoint[]) {
  return [
    "case",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "confirmed")],
    ],
    "#ff4d4d",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "suspected")],
    ],
    "#ffb020",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "monitoring")],
    ],
    "#c084fc",
    "rgba(0, 0, 0, 0)",
  ];
}

function createStatusLineOpacityExpression(outbreaks: OutbreakDataPoint[]) {
  return [
    "case",
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "confirmed")],
    ],
    0.95,
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "suspected")],
    ],
    0.95,
    [
      "in",
      COUNTRY_NAME_EXPRESSION,
      ["literal", getCountryNamesByStatus(outbreaks, "monitoring")],
    ],
    0.85,
    0,
  ];
}

const COUNTRY_ISO_CODES: Record<string, string> = {
  Argentina: "AR",
  "South Africa": "ZA",
  UK: "GB",
  Netherlands: "NL",
  USA: "US",
  Singapore: "SG",
  Germany: "DE",
  Switzerland: "CH",
  Canada: "CA",
  Denmark: "DK",
  "New Zealand": "NZ",
  "Saint Kitts and Nevis": "KN",
  Sweden: "SE",
  Turkey: "TR",
  Spain: "ES",
  France: "FR",
  Sudan: "SD",
  Israel: "IL",
  Palestine: "PS",
  Ukraine: "UA",
  "Cabo Verde": "CV",
  Georgia: "GE",
  Iran: "IR",
  Senegal: "SN",
  Chile: "CL",
  Uruguay: "UY",
};

function formatLastUpdated(isoString: string, language: SupportedLanguage): string {
  try {
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

function translateCountryName(name: string, language: SupportedLanguage): string {
  const code = COUNTRY_ISO_CODES[name];
  if (!code) return name;
  try {
    return new Intl.DisplayNames([language], { type: "region" }).of(code) ?? name;
  } catch {
    return name;
  }
}

type CountryProperties = Record<string, unknown>;

function asText(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function createOutbreakPopupContent(
  properties: CountryProperties,
  language: SupportedLanguage,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "outbreak-popup";

  const title = document.createElement("strong");
  const rawName = asText(properties.name);
  title.textContent = rawName ? translateCountryName(rawName, language) : "Outbreak location";

  const cases = document.createElement("p");
  cases.textContent = `${translateUiText("Confirmed Cases:", language)} ${asText(properties.confirmedCases) || "0"}`;

  const deaths = document.createElement("p");
  deaths.textContent = `${translateUiText("Deaths:", language)} ${asText(properties.deaths) || "0"}`;

  wrapper.append(title, cases, deaths);
  return wrapper;
}

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [outbreaks, setOutbreaks] = useState<OutbreakDataPoint[]>(loadOutbreaks);
  const [lastUpdated, setLastUpdated] = useState<string | null>(getLastUpdated);
  const outbreaksRef = useRef(outbreaks);
  const languageRef = useRef<SupportedLanguage>("en");
  const [language, setLanguage] = useState<SupportedLanguage>(
    () => getSavedLanguage() ?? "en",
  );
  const showAdmin =
    new URLSearchParams(window.location.search).get("admin") === "true";
  const totals = useMemo(
    () => ({
      cases: outbreaks.reduce((sum, outbreak) => sum + outbreak.confirmedCases, 0),
      deaths: outbreaks.reduce((sum, outbreak) => sum + outbreak.deaths, 0),
      countries: outbreaks.length,
    }),
    [outbreaks],
  );

  useEffect(() => {
    let isMounted = true;

    if (getSavedLanguage()) {
      return;
    }

    void detectLanguage().then((detectedLanguage) => {
      if (isMounted) {
        setLanguage(detectedLanguage);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const refreshOutbreaks = () => {
      setOutbreaks(loadOutbreaks());
      setLastUpdated(getLastUpdated());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === OUTBREAK_STORAGE_KEY) {
        refreshOutbreaks();
      }
    };

    window.addEventListener(OUTBREAK_STORAGE_EVENT, refreshOutbreaks);
    window.addEventListener("storage", handleStorage);
    void fetchSharedOutbreaks();

    return () => {
      window.removeEventListener(OUTBREAK_STORAGE_EVENT, refreshOutbreaks);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (showAdmin) {
      return;
    }

    if (!mapContainer.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLE_URL,
      center: [0, 20],
      zoom: 2.0,
      minZoom: 1.2,
      maxZoom: 6,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      "top-right",
    );

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });

      map.getStyle().layers?.forEach((layer) => {
        if (layer.type === "background") {
          map.setPaintProperty(layer.id, "background-color", "rgba(0, 0, 0, 0)");
        }

        if (layer.type === "symbol") {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }

        const sourceLayer =
          "source-layer" in layer ? String(layer["source-layer"]) : "";
        const layerName = `${layer.id} ${sourceLayer}`.toLowerCase();

        if (layerName.includes("water")) {
          if (layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#03142c");
          }

          if (layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#03142c");
          }
        }
      });

      if (!map.getSource("ocean-globe")) {
        map.addSource("ocean-globe", {
          type: "geojson",
          data: OCEAN_GLOBE_POLYGON,
        });
      }

      if (!map.getLayer("ocean-globe-fill")) {
        map.addLayer({
          id: "ocean-globe-fill",
          type: "fill",
          source: "ocean-globe",
          paint: {
            "fill-color": "#03142c",
            "fill-opacity": 1,
          },
        });
      }

      if (!map.getSource("countries")) {
        map.addSource("countries", {
          type: "geojson",
          data: COUNTRIES_URL,
          generateId: true,
        });
      }

      if (!map.getLayer("country-fills")) {
        map.addLayer({
          id: "country-fills",
          type: "fill",
          source: "countries",
          paint: {
            "fill-color": "#3e4550",
            "fill-opacity": 1,
          },
        });
      }

      if (!map.getLayer("country-borders")) {
        map.addLayer({
          id: "country-borders",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#ffffff",
            "line-opacity": 0.45,
            "line-width": 0.8,
          },
        });
      }

      if (!map.getLayer("hantavirus-country-status-fills")) {
        map.addLayer({
          id: "hantavirus-country-status-fills",
          type: "fill",
          source: "countries",
          paint: {
            "fill-color": createStatusFillColorExpression(outbreaks),
            "fill-opacity": createStatusFillOpacityExpression(outbreaks),
          },
        });
      }

      if (!map.getLayer("hantavirus-country-status-outlines")) {
        map.addLayer({
          id: "hantavirus-country-status-outlines",
          type: "line",
          source: "countries",
          paint: {
            "line-color": createStatusLineColorExpression(outbreaks),
            "line-opacity": createStatusLineOpacityExpression(outbreaks),
            "line-width": 2,
          },
        });
      }

      if (!map.getSource("hantavirus-outbreaks")) {
        map.addSource("hantavirus-outbreaks", {
          type: "geojson",
          data: createOutbreaksGeoJson(outbreaks),
        });
      }

      if (!map.getLayer("hantavirus-outbreak-markers")) {
        map.addLayer({
          id: "hantavirus-outbreak-markers",
          type: "circle",
          source: "hantavirus-outbreaks",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "confirmedCases"],
              0,
              5,
              1,
              8,
              2,
              12,
              10,
              22,
            ],
            "circle-color": [
              "match",
              ["get", "status"],
              "confirmed",
              "#e53935",
              "suspected",
              "#f59e0b",
              "monitoring",
              "#8b5cf6",
              "#8b5cf6",
            ],
            "circle-opacity": 0.9,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1.5,
          },
        });
      }
    });

    map.on("mouseenter", "hantavirus-outbreak-markers", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "hantavirus-outbreak-markers", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("click", "hantavirus-outbreak-markers", (event) => {
      const feature = event.features?.[0];
      const coordinates =
        feature?.geometry.type === "Point"
          ? feature.geometry.coordinates.slice()
          : null;

      if (!feature || !coordinates) {
        return;
      }

      const statusColors: Record<string, string> = {
        confirmed: "#e53935",
        suspected: "#f59e0b",
        monitoring: "#8b5cf6",
      };
      const color = statusColors[feature.properties?.status] ?? "#8b5cf6";
      const point = map.project(coordinates as [number, number]);

      for (let i = 0; i < 2; i++) {
        const ring = document.createElement("div");
        ring.className = "dot-pulse";
        ring.style.left = `${point.x}px`;
        ring.style.top = `${point.y}px`;
        ring.style.borderColor = color;
        ring.style.animationDelay = `${i * 150}ms`;
        mapContainer.current?.appendChild(ring);
        ring.addEventListener("animationend", () => ring.remove());
      }

      new maplibregl.Popup({ closeButton: true, closeOnClick: true })
        .setLngLat(coordinates as [number, number])
        .setDOMContent(createOutbreakPopupContent(feature.properties ?? {}, languageRef.current))
        .addTo(map);
    });

    const STATUS_COLORS: Record<string, string> = {
      confirmed: "#e53935",
      suspected: "#f59e0b",
      monitoring: "#8b5cf6",
    };

    let pingTimeout: ReturnType<typeof setTimeout> | null = null;

    function firePing() {
      if (!mapContainer.current) return;

      const visible = map.queryRenderedFeatures(undefined, {
        layers: ["hantavirus-outbreak-markers"],
      });
      if (!visible.length) return;

      const feature = visible[Math.floor(Math.random() * visible.length)];
      if (feature.geometry.type !== "Point") return;

      const [lng, lat] = feature.geometry.coordinates;
      const point = map.project([lng, lat]);
      const color = STATUS_COLORS[feature.properties?.status] ?? "#8b5cf6";

      for (let i = 0; i < 2; i++) {
        const ring = document.createElement("div");
        ring.className = "dot-pulse";
        ring.style.left = `${point.x}px`;
        ring.style.top = `${point.y}px`;
        ring.style.borderColor = color;
        ring.style.animationDelay = `${i * 160}ms`;
        mapContainer.current.appendChild(ring);
        ring.addEventListener("animationend", () => ring.remove());
      }
    }

    function schedulePing() {
      const delay = 15000 + Math.random() * 15000;
      pingTimeout = setTimeout(() => {
        firePing();
        schedulePing();
      }, delay);
    }

    map.once("load", schedulePing);

    return () => {
      if (pingTimeout !== null) clearTimeout(pingTimeout);
      map.remove();
      mapRef.current = null;
    };
  }, [showAdmin]);

  useEffect(() => {
    outbreaksRef.current = outbreaks;
  }, [outbreaks]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || showAdmin || !map.isStyleLoaded()) {
      return;
    }

    const source = map.getSource("hantavirus-outbreaks") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(createOutbreaksGeoJson(outbreaks));

    if (map.getLayer("hantavirus-country-status-fills")) {
      map.setPaintProperty(
        "hantavirus-country-status-fills",
        "fill-color",
        createStatusFillColorExpression(outbreaks),
      );
      map.setPaintProperty(
        "hantavirus-country-status-fills",
        "fill-opacity",
        createStatusFillOpacityExpression(outbreaks),
      );
    }

    if (map.getLayer("hantavirus-country-status-outlines")) {
      map.setPaintProperty(
        "hantavirus-country-status-outlines",
        "line-color",
        createStatusLineColorExpression(outbreaks),
      );
      map.setPaintProperty(
        "hantavirus-country-status-outlines",
        "line-opacity",
        createStatusLineOpacityExpression(outbreaks),
      );
    }
  }, [outbreaks, showAdmin]);

  if (showAdmin) {
    return <Admin />;
  }

  return (
    <main className="app-shell">
      <LanguageSelector language={language} onChange={setLanguage} />
      <nav className="top-navbar" aria-label="Primary">
        <div className="brand-group">
          <h1>hantamaps.com</h1>
          <span className="live-badge">LIVE</span>
        </div>
      </nav>

      <section className="stats-bar" aria-label="Hantavirus summary">
        <article className="stat-card">
          <span>{translateUiText("Confirmed Cases:", language)}</span>
          <strong>{totals.cases}</strong>
        </article>
        <article className="stat-card">
          <span>{translateUiText("Deaths:", language)}</span>
          <strong>{totals.deaths}</strong>
        </article>
        <article className="stat-card">
          <span>{translateUiText("Countries Affected:", language)}</span>
          <strong>{totals.countries}</strong>
        </article>
      </section>

      <section className="content-layout">
        <section className="globe-stage" aria-label="Global hantavirus map">
          <div ref={mapContainer} className="map-container" />
          {lastUpdated && (
            <div className="last-updated" aria-label="Data last updated">
              {translateUiText("Last updated:", language)}{" "}
              {formatLastUpdated(lastUpdated, language)}
            </div>
          )}
          <div className="map-legend" aria-label="Map status legend">
            <span>
              <i className="legend-dot legend-dot-confirmed" />
              {translateUiText("Confirmed", language)}
            </span>
            <span>
              <i className="legend-dot legend-dot-suspected" />
              {translateUiText("Suspected", language)}
            </span>
            <span>
              <i className="legend-dot legend-dot-monitoring" />
              {translateUiText("Monitoring", language)}
            </span>
          </div>
        </section>
        <NewsFeed language={language} />
      </section>

      <footer className="page-footer">
        <a
          className="footer-link"
          href={language === "en" ? "/hantavirus-learn-more.html" : `/hantavirus-learn-more-${language}.html`}
        >
          {translateUiText("Learn More", language)}
        </a>
        <a
          className="footer-link"
          href={language === "en" ? "/hantavirus-prevention.html" : `/hantavirus-prevention-${language}.html`}
        >
          {translateUiText("Prevention Guide", language)}
        </a>
        <a className="footer-link" href="/privacy.html">
          {translateUiText("Privacy Policy", language)}
        </a>
      </footer>

      <div
        className={`ticker${language === "ar" ? " ticker--rtl" : ""}`}
        aria-label="Outbreak news ticker"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="ticker-track">
          <p>{TICKER_TEXT[language]}</p>
          <p aria-hidden="true">{TICKER_TEXT[language]}</p>
          <p aria-hidden="true">{TICKER_TEXT[language]}</p>
        </div>
      </div>
    </main>
  );
}
