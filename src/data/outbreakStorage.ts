import {
  hantavirusOutbreaks,
  OutbreakDataPoint,
  OutbreakStatus,
} from "./outbreaks";

export const OUTBREAK_STORAGE_KEY = "hantatracker.outbreaks";
export const OUTBREAK_STORAGE_EVENT = "hantatracker:outbreaks-updated";

const VALID_STATUSES: OutbreakStatus[] = [
  "confirmed",
  "suspected",
  "monitoring",
];

type StoredOutbreakData = {
  updatedAt?: string;
  source?: string;
  outbreaks: OutbreakDataPoint[];
};

function isStatus(value: unknown): value is OutbreakStatus {
  return typeof value === "string" && VALID_STATUSES.includes(value as OutbreakStatus);
}

function normalizeOutbreak(value: unknown): OutbreakDataPoint | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<OutbreakDataPoint>;

  if (
    typeof candidate.name !== "string" ||
    !Number.isFinite(candidate.latitude) ||
    !Number.isFinite(candidate.longitude) ||
    !Number.isFinite(candidate.confirmedCases) ||
    !Number.isFinite(candidate.deaths) ||
    !isStatus(candidate.status)
  ) {
    return null;
  }

  return {
    name: candidate.name,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    confirmedCases: Math.max(0, Math.round(candidate.confirmedCases)),
    deaths: Math.max(0, Math.round(candidate.deaths)),
    status: candidate.status,
  };
}

export function getLastUpdated(): string | null {
  try {
    const storedValue = window.localStorage.getItem(OUTBREAK_STORAGE_KEY);
    if (!storedValue) return null;
    const parsed = JSON.parse(storedValue) as unknown;
    if (parsed && typeof parsed === "object" && "updatedAt" in parsed) {
      return (parsed as { updatedAt: string }).updatedAt;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadOutbreaks(): OutbreakDataPoint[] {
  try {
    const storedValue = window.localStorage.getItem(OUTBREAK_STORAGE_KEY);

    if (!storedValue) {
      return hantavirusOutbreaks;
    }

    const parsed = JSON.parse(storedValue) as unknown;
    const storedItems =
      parsed &&
      typeof parsed === "object" &&
      "outbreaks" in parsed &&
      Array.isArray((parsed as StoredOutbreakData).outbreaks)
        ? (parsed as StoredOutbreakData).outbreaks
        : parsed;

    if (!Array.isArray(storedItems)) {
      return hantavirusOutbreaks;
    }

    const storedOutbreaks = storedItems
      .map(normalizeOutbreak)
      .filter((item): item is OutbreakDataPoint => item !== null);

    return storedOutbreaks.length > 0 ? storedOutbreaks : hantavirusOutbreaks;
  } catch (error) {
    console.error("Failed to load stored outbreak data:", error);
    return hantavirusOutbreaks;
  }
}

export function saveOutbreaks(outbreaks: OutbreakDataPoint[]) {
  window.localStorage.setItem(
    OUTBREAK_STORAGE_KEY,
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      source: "local-admin",
      outbreaks,
    }),
  );
  window.dispatchEvent(new CustomEvent(OUTBREAK_STORAGE_EVENT));
}

export async function fetchSharedOutbreaks(): Promise<OutbreakDataPoint[] | null> {
  try {
    const response = await fetch("/data.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as StoredOutbreakData;

    if (!Array.isArray(data.outbreaks)) {
      return null;
    }

    const outbreaks = data.outbreaks
      .map(normalizeOutbreak)
      .filter((item): item is OutbreakDataPoint => item !== null);

    if (outbreaks.length === 0) {
      return null;
    }

    window.localStorage.setItem(
      OUTBREAK_STORAGE_KEY,
      JSON.stringify({
        updatedAt: data.updatedAt ?? new Date().toISOString(),
        source: data.source ?? "github-actions",
        outbreaks,
      }),
    );
    window.dispatchEvent(new CustomEvent(OUTBREAK_STORAGE_EVENT));

    return outbreaks;
  } catch (error) {
    console.error("Failed to fetch shared outbreak data:", error);
    return null;
  }
}
