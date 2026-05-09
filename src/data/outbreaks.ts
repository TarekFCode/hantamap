export type OutbreakStatus = "confirmed" | "suspected" | "monitoring";

export type OutbreakDataPoint = {
  name: string;
  latitude: number;
  longitude: number;
  confirmedCases: number;
  deaths: number;
  status: OutbreakStatus;
};

export const hantavirusOutbreaks: OutbreakDataPoint[] = [
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
    confirmedCases: 0,
    deaths: 0,
    status: "monitoring",
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
];
