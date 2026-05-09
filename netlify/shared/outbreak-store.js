import { getStore } from "@netlify/blobs";

export const OUTBREAK_BLOB_KEY = "data.json";
export const OUTBREAK_STORE_NAME = "outbreak-data";

export const DEFAULT_OUTBREAK_DATA = {
  updatedAt: "2026-05-09T00:00:00.000Z",
  source: "default",
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
      confirmedCases: 0,
      deaths: 0,
      status: "monitoring",
    },
    {
      name: "Singapore",
      latitude: 1.3521,
      longitude: 103.8198,
      confirmedCases: 1,
      deaths: 0,
      status: "suspected",
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
