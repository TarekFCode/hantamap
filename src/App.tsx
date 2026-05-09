import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import Admin from "./components/Admin";
import NewsFeed from "./components/NewsFeed";
import { OutbreakDataPoint, OutbreakStatus } from "./data/outbreaks";
import {
  fetchSharedOutbreaks,
  loadOutbreaks,
  OUTBREAK_STORAGE_EVENT,
  OUTBREAK_STORAGE_KEY,
} from "./data/outbreakStorage";

const STYLE_URL = "https://demotiles.maplibre.org/globe.json";
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

function createOutbreakPopupContent(properties: CountryProperties): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "outbreak-popup";

  const title = document.createElement("strong");
  title.textContent = asText(properties.name) || "Outbreak location";

  const cases = document.createElement("p");
  cases.textContent = `Cases: ${asText(properties.confirmedCases) || "0"}`;

  const deaths = document.createElement("p");
  deaths.textContent = `Deaths: ${asText(properties.deaths) || "0"}`;

  wrapper.append(title, cases, deaths);
  return wrapper;
}

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [outbreaks, setOutbreaks] = useState<OutbreakDataPoint[]>(loadOutbreaks);
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
    const refreshOutbreaks = () => setOutbreaks(loadOutbreaks());
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
      zoom: 1.3,
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
            "fill-color": "#969da2",
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

      new maplibregl.Popup({ closeButton: true, closeOnClick: true })
        .setLngLat(coordinates as [number, number])
        .setDOMContent(createOutbreakPopupContent(feature.properties ?? {}))
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [showAdmin]);

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
      <nav className="top-navbar" aria-label="Primary">
        <div className="brand-group">
          <h1>HantaTracker 🦠</h1>
          <span className="live-badge">LIVE</span>
        </div>
      </nav>

      <section className="stats-bar" aria-label="Hantavirus summary">
        <article className="stat-card">
          <span>Confirmed Cases:</span>
          <strong>{totals.cases}</strong>
        </article>
        <article className="stat-card">
          <span>Deaths:</span>
          <strong>{totals.deaths}</strong>
        </article>
        <article className="stat-card">
          <span>Countries Affected:</span>
          <strong>{totals.countries}</strong>
        </article>
      </section>

      <section className="content-layout">
        <section className="globe-stage" aria-label="Global hantavirus map">
          <div ref={mapContainer} className="map-container" />
          <div className="map-legend" aria-label="Map status legend">
            <span>
              <i className="legend-dot legend-dot-confirmed" />
              Confirmed
            </span>
            <span>
              <i className="legend-dot legend-dot-suspected" />
              Suspected
            </span>
            <span>
              <i className="legend-dot legend-dot-monitoring" />
              Monitoring
            </span>
          </div>
        </section>
        <NewsFeed />
      </section>

      <div className="ticker" aria-label="Outbreak news ticker">
        <div className="ticker-track">
          <p>
            SOURCE: WHO • Last updated May 9 2026 • MV Hondius cruise ship
            outbreak • Andes virus confirmed • Global risk: LOW per WHO • Stay
            informed •
          </p>
          <p aria-hidden="true">
            SOURCE: WHO • Last updated May 9 2026 • MV Hondius cruise ship
            outbreak • Andes virus confirmed • Global risk: LOW per WHO • Stay
            informed •
          </p>
          <p aria-hidden="true">
            SOURCE: WHO • Last updated May 9 2026 • MV Hondius cruise ship
            outbreak • Andes virus confirmed • Global risk: LOW per WHO • Stay
            informed •
          </p>
        </div>
      </div>
    </main>
  );
}
