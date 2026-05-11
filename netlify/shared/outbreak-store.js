import { getStore } from "@netlify/blobs";

export const OUTBREAK_BLOB_KEY = "data.json";
export const OUTBREAK_STORE_NAME = "outbreak-data";

export const DEFAULT_OUTBREAK_DATA = {
  updatedAt: "2026-05-11T16:24:12.581Z",
  source: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599",
  outbreaks: [
    {
      name: "Argentina",
      latitude: -38.4161,
      longitude: -63.6167,
      confirmedCases: 2,
      deaths: 1,
      status: "confirmed",
    },
    {
      name: "South Africa",
      latitude: -30.5595,
      longitude: 22.9375,
      confirmedCases: 2,
      deaths: 1,
      status: "confirmed",
    },
    {
      name: "UK",
      latitude: 55.3781,
      longitude: -3.436,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Netherlands",
      latitude: 52.1326,
      longitude: 5.2913,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "USA",
      latitude: 39.8283,
      longitude: -98.5795,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Singapore",
      latitude: 1.3521,
      longitude: 103.8198,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Germany",
      latitude: 51.1657,
      longitude: 10.4515,
      confirmedCases: 1,
      deaths: 1,
      status: "suspected",
    },
    {
      name: "Switzerland",
      latitude: 46.8182,
      longitude: 8.2275,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Canada",
      latitude: 56.1304,
      longitude: -106.3468,
      confirmedCases: 1,
      deaths: 0,
      status: "suspected",
    },
    {
      name: "Denmark",
      latitude: 56.2639,
      longitude: 9.5018,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "New Zealand",
      latitude: -40.9006,
      longitude: 174.886,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Saint Kitts and Nevis",
      latitude: 17.3578,
      longitude: -62.783,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Sweden",
      latitude: 60.1282,
      longitude: 18.6435,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Turkey",
      latitude: 38.9637,
      longitude: 35.2433,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Spain",
      latitude: 40.4637,
      longitude: -3.7492,
      confirmedCases: 2,
      deaths: 0,
      status: "suspected",
    },
    {
      name: "France",
      latitude: 46.2276,
      longitude: 2.2137,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Sudan",
      latitude: 12.8628,
      longitude: 30.2176,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Israel",
      latitude: 31.0461,
      longitude: 34.8516,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Palestine",
      latitude: 31.9522,
      longitude: 35.2332,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Ukraine",
      latitude: 48.3794,
      longitude: 31.1656,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Cabo Verde",
      latitude: 16.5388,
      longitude: -23.0418,
      confirmedCases: 1,
      deaths: 0,
      status: "suspected",
    },
    {
      name: "Georgia",
      latitude: 42.3154,
      longitude: 43.3569,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Iran",
      latitude: 32.4279,
      longitude: 53.688,
      confirmedCases: 1,
      deaths: 0,
      status: "suspected",
    },
    {
      name: "Senegal",
      latitude: 14.4974,
      longitude: -14.4524,
      confirmedCases: 1,
      deaths: 0,
      status: "suspected",
    },
    {
      name: "Chile",
      latitude: -35.6751,
      longitude: -71.543,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Uruguay",
      latitude: -32.5228,
      longitude: -55.7658,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Luxembourg",
      latitude: 49.8153,
      longitude: 6.1296,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Central African Republic",
      latitude: 6.6111,
      longitude: 20.9394,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Norway",
      latitude: 60.472,
      longitude: 8.4689,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Guatemala",
      latitude: 15.7835,
      longitude: -90.2308,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "India",
      latitude: 20.5937,
      longitude: 78.9629,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Philippines",
      latitude: 12.8797,
      longitude: 121.774,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Belgium",
      latitude: 50.5039,
      longitude: 4.4699,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Greece",
      latitude: 39.0742,
      longitude: 21.8243,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Italy",
      latitude: 41.8719,
      longitude: 12.5674,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Montenegro",
      latitude: 42.7087,
      longitude: 19.3744,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Portugal",
      latitude: 39.3999,
      longitude: -8.2245,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Australia",
      latitude: -25.2744,
      longitude: 133.7751,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Japan",
      latitude: 36.2048,
      longitude: 138.2529,
      confirmedCases: 1,
      deaths: 0,
      status: "suspected",
    },
    {
      name: "Mexico",
      latitude: 23.6345,
      longitude: -102.5528,
      confirmedCases: 1,
      deaths: 0,
      status: "confirmed",
    },
    {
      name: "Bangladesh",
      latitude: 23.685,
      longitude: 90.3563,
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
  ],
};

const VALID_STATUSES = new Set(["confirmed", "suspected", "monitoring"]);

function normalizeOutbreak(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (
    typeof value.name !== "string" ||
    !Number.isFinite(value.latitude) ||
    !Number.isFinite(value.longitude) ||
    !Number.isFinite(value.confirmedCases) ||
    !Number.isFinite(value.deaths) ||
    !VALID_STATUSES.has(value.status)
  ) {
    return null;
  }

  return {
    name: value.name,
    latitude: value.latitude,
    longitude: value.longitude,
    confirmedCases: Math.max(0, Math.round(value.confirmedCases)),
    deaths: Math.max(0, Math.round(value.deaths)),
    status: value.status,
  };
}

export function normalizeOutbreakData(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.outbreaks)) {
    return DEFAULT_OUTBREAK_DATA;
  }

  const outbreaks = value.outbreaks
    .map(normalizeOutbreak)
    .filter((item) => item !== null);

  if (outbreaks.length === 0) {
    return DEFAULT_OUTBREAK_DATA;
  }

  return {
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : new Date().toISOString(),
    source: typeof value.source === "string" ? value.source : "netlify-blobs",
    outbreaks,
  };
}

export async function readOutbreakData() {
  const store = getStore(OUTBREAK_STORE_NAME);
  const storedValue = await store.get(OUTBREAK_BLOB_KEY, { type: "json" });

  if (!storedValue) {
    return DEFAULT_OUTBREAK_DATA;
  }

  return normalizeOutbreakData(storedValue);
}

export async function writeOutbreakData(data) {
  const normalizedData = normalizeOutbreakData(data);
  const store = getStore(OUTBREAK_STORE_NAME);

  await store.setJSON(OUTBREAK_BLOB_KEY, normalizedData);

  return normalizedData;
}
