const NUMBER_WORDS = new Map([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
]);

const STATUS_PRIORITY = {
  monitoring: 1,
  suspected: 2,
  confirmed: 3,
};

export const COUNTRY_CATALOG = [
  {
    name: "Argentina",
    latitude: -38.4161,
    longitude: -63.6167,
    aliases: ["Argentina", "Argentine"],
  },
  {
    name: "South Africa",
    latitude: -30.5595,
    longitude: 22.9375,
    aliases: ["South Africa", "Johannesburg"],
  },
  {
    name: "UK",
    latitude: 55.3781,
    longitude: -3.436,
    aliases: [
      "UK",
      "United Kingdom",
      "United Kingdom of Great Britain and Northern Ireland",
      "British",
    ],
  },
  {
    name: "Netherlands",
    latitude: 52.1326,
    longitude: 5.2913,
    aliases: ["Netherlands", "Dutch", "RIVM"],
  },
  {
    name: "USA",
    latitude: 39.8283,
    longitude: -98.5795,
    aliases: [
      "USA",
      "US",
      "U.S.",
      "United States",
      "United States of America",
      "American",
    ],
  },
  {
    name: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    aliases: ["Singapore"],
  },
  {
    name: "Germany",
    latitude: 51.1657,
    longitude: 10.4515,
    aliases: ["Germany", "German"],
  },
  {
    name: "Switzerland",
    latitude: 46.8182,
    longitude: 8.2275,
    aliases: ["Switzerland", "Swiss", "Zurich"],
  },
  {
    name: "Canada",
    latitude: 56.1304,
    longitude: -106.3468,
    aliases: ["Canada", "Canadian"],
  },
  {
    name: "Denmark",
    latitude: 56.2639,
    longitude: 9.5018,
    aliases: ["Denmark", "Danish"],
  },
  {
    name: "New Zealand",
    latitude: -40.9006,
    longitude: 174.886,
    aliases: ["New Zealand"],
  },
  {
    name: "Saint Kitts and Nevis",
    latitude: 17.3578,
    longitude: -62.783,
    aliases: ["Saint Kitts and Nevis", "St Kitts and Nevis", "St. Kitts and Nevis"],
  },
  {
    name: "Sweden",
    latitude: 60.1282,
    longitude: 18.6435,
    aliases: ["Sweden", "Swedish"],
  },
  {
    name: "Turkey",
    latitude: 38.9637,
    longitude: 35.2433,
    aliases: ["Turkey", "Türkiye", "Turkish"],
  },
  {
    name: "Australia",
    latitude: -25.2744,
    longitude: 133.7751,
    aliases: ["Australia", "Australian"],
  },
];

function toNumber(value) {
  const normalized = String(value).trim().toLowerCase();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return NUMBER_WORDS.get(normalized);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCountryConfig(countryName) {
  return (
    COUNTRY_CATALOG.find((country) => country.name === countryName) ?? {
      name: countryName,
      aliases: [countryName],
    }
  );
}

function getSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function getSentencesMentioningCountry(text, countryName) {
  const country = getCountryConfig(countryName);
  const regexes = country.aliases.map((alias) => {
    const escapedAlias = escapeRegExp(alias);
    const startsWithWord = /^\w/.test(alias);
    const endsWithWord = /\w$/.test(alias);

    return new RegExp(
      `${startsWithWord ? "\\b" : ""}${escapedAlias}${endsWithWord ? "\\b" : ""}`,
      "i",
    );
  });

  return getSentences(text).filter((sentence) =>
    regexes.some((regex) => regex.test(sentence)),
  );
}

function extractDirectCaseCount(sentences) {
  for (const sentence of sentences) {
    const match = sentence.match(
      /([a-z\d]+)\s+(?:laboratory[-\s])?(?:confirmed\s+)?cases?.*?including\s+([a-z\d]+)\s+deaths?/i,
    );

    if (match) {
      return {
        confirmedCases: toNumber(match[1]),
        deaths: toNumber(match[2]),
      };
    }
  }

  return null;
}

function inferStatus(sentences) {
  const text = sentences.join(" ");

  if (
    /(?:confirmed|lab-confirmed|laboratory confirmed|tested positive|tests? positive|positive for hantavirus|confirmed by PCR)/i.test(
      text,
    )
  ) {
    return "confirmed";
  }

  if (
    /(?:suspected|symptomatic|fell ill|serious condition|critically ill|intensive care|hospitali[sz]ed|medical(?:ly)? evacuated|evacuat(?:ed|ion))/i.test(
      text,
    )
  ) {
    return "suspected";
  }

  if (
    /(?:monitor(?:ed|ing)?|contact tracing|self-isolat(?:e|ion)|quarantine|under observation|tracking|traced to|returned|disembarked|repatriat(?:ed|ion)|potentially exposed|exposure)/i.test(
      text,
    )
  ) {
    return "monitoring";
  }

  return null;
}

function inferMinimumCounts(outbreak, status, sentences) {
  if (status === "monitoring") {
    return outbreak;
  }

  const text = sentences.join(" ");
  const hasDeath = /(?:died|death|deceased|fatalit)/i.test(text);

  return {
    ...outbreak,
    confirmedCases: Math.max(outbreak.confirmedCases, 1),
    deaths: hasDeath ? Math.max(outbreak.deaths, 1) : outbreak.deaths,
  };
}

function applySouthAfricaNarrative(outbreak, sourceText) {
  let confirmedCases = 0;
  let deaths = 0;

  if (
    /laboratory testing conducted in South Africa confirmed hantavirus infection in one patient/i.test(
      sourceText,
    )
  ) {
    confirmedCases += 1;
  }

  if (
    /flight to Johannesburg, South Africa.*?died.*?confirmed by PCR with hantavirus infection/i.test(
      sourceText,
    )
  ) {
    confirmedCases += 1;
    deaths += 1;
  }

  if (confirmedCases === 0) {
    return null;
  }

  return {
    ...outbreak,
    confirmedCases,
    deaths,
    status: "confirmed",
  };
}

function createOutbreakFromCatalog(country) {
  return {
    name: country.name,
    latitude: country.latitude,
    longitude: country.longitude,
    confirmedCases: 0,
    deaths: 0,
    status: "monitoring",
  };
}

function applyStatus(outbreak, nextStatus) {
  if (!nextStatus) {
    return outbreak;
  }

  if (STATUS_PRIORITY[nextStatus] < STATUS_PRIORITY[outbreak.status]) {
    return outbreak;
  }

  return {
    ...outbreak,
    status: nextStatus,
  };
}

export function applySourceTextUpdates(outbreaks, sourceText) {
  const notes = [];
  const byName = new Map(outbreaks.map((outbreak) => [outbreak.name, outbreak]));

  for (const country of COUNTRY_CATALOG) {
    const sentences = getSentencesMentioningCountry(sourceText, country.name);

    if (sentences.length === 0) {
      continue;
    }

    const current = byName.get(country.name) ?? createOutbreakFromCatalog(country);
    const directCount = extractDirectCaseCount(sentences);

    if (directCount?.confirmedCases !== undefined) {
      byName.set(country.name, {
        ...current,
        confirmedCases: directCount.confirmedCases,
        deaths: directCount.deaths ?? current.deaths,
        status: directCount.confirmedCases > 0 ? "confirmed" : current.status,
      });
      notes.push(
        `${country.name}: direct source count set to ${directCount.confirmedCases} cases and ${directCount.deaths ?? current.deaths} deaths.`,
      );
      continue;
    }

    if (country.name === "South Africa") {
      const southAfricaUpdate = applySouthAfricaNarrative(current, sourceText);

      if (southAfricaUpdate) {
        byName.set(country.name, southAfricaUpdate);
        notes.push(
          `South Africa: source narrative set to ${southAfricaUpdate.confirmedCases} cases and ${southAfricaUpdate.deaths} deaths.`,
        );
        continue;
      }
    }

    const inferredStatus = inferStatus(sentences);

    if (!inferredStatus) {
      continue;
    }

    const statusUpdate = inferMinimumCounts(
      applyStatus(current, inferredStatus),
      inferredStatus,
      sentences,
    );
    byName.set(country.name, statusUpdate);

    if (!outbreaks.some((outbreak) => outbreak.name === country.name)) {
      notes.push(`${country.name}: added as ${statusUpdate.status}.`);
    } else if (statusUpdate.status !== current.status) {
      notes.push(`${country.name}: status set to ${statusUpdate.status}.`);
    }
  }

  return {
    outbreaks: [...byName.values()],
    notes,
  };
}
