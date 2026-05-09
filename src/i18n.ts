export type SupportedLanguage = "en" | "de" | "fr" | "es" | "nl" | "ar";

export const LANGUAGE_STORAGE_KEY = "hantatracker.language";

export const LANGUAGE_OPTIONS: Array<{
  code: SupportedLanguage;
  label: string;
  shortLabel: string;
}> = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "de", label: "Deutsch", shortLabel: "DE" },
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "es", label: "Español", shortLabel: "ES" },
  { code: "nl", label: "Nederlands", shortLabel: "NL" },
  { code: "ar", label: "العربية", shortLabel: "AR" },
];

const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  AT: "de",
  CH: "de",
  DE: "de",
  BE: "fr",
  FR: "fr",
  LU: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  NL: "nl",
  AE: "ar",
  BH: "ar",
  DZ: "ar",
  EG: "ar",
  IQ: "ar",
  JO: "ar",
  KW: "ar",
  LB: "ar",
  LY: "ar",
  MA: "ar",
  OM: "ar",
  PS: "ar",
  QA: "ar",
  SA: "ar",
  SD: "ar",
  SY: "ar",
  TN: "ar",
  YE: "ar",
};

const IP_API_URL = "https://ipapi.co/json/";
const MY_MEMORY_URL = "https://api.mymemory.translated.net/get";
const TRANSLATION_CACHE_PREFIX = "hantatracker.translation.v2.";

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    "Live News Feed": "Live News Feed",
    Sources: "Sources",
    "Fetching latest reports": "Fetching latest reports",
    Translating: "Translating",
    "No articles found": "No articles found",
    "Unknown source": "Unknown source",
    "Just now": "Just now",
    "Confirmed Cases:": "Confirmed Cases:",
    "Deaths:": "Deaths:",
    "Countries Affected:": "Countries Affected:",
    Confirmed: "Confirmed",
    Suspected: "Suspected",
    Monitoring: "Monitoring",
    "Privacy Policy": "Privacy Policy",
  },
  de: {
    "Live News Feed": "Live-Nachrichten",
    Sources: "Quellen",
    "Fetching latest reports": "Neueste Berichte werden geladen",
    Translating: "Wird übersetzt",
    "No articles found": "Keine Artikel gefunden",
    "Unknown source": "Unbekannte Quelle",
    "Just now": "Gerade eben",
    "Confirmed Cases:": "Bestätigte Fälle:",
    "Deaths:": "Todesfälle:",
    "Countries Affected:": "Betroffene Länder:",
    Confirmed: "Bestätigt",
    Suspected: "Verdächtig",
    Monitoring: "Beobachtung",
    "Privacy Policy": "Datenschutz",
  },
  fr: {
    "Live News Feed": "Fil d'actualités",
    Sources: "Sources",
    "Fetching latest reports": "Chargement des derniers rapports",
    Translating: "Traduction",
    "No articles found": "Aucun article trouvé",
    "Unknown source": "Source inconnue",
    "Just now": "À l'instant",
    "Confirmed Cases:": "Cas confirmés :",
    "Deaths:": "Décès :",
    "Countries Affected:": "Pays touchés :",
    Confirmed: "Confirmé",
    Suspected: "Suspect",
    Monitoring: "Surveillance",
    "Privacy Policy": "Confidentialité",
  },
  es: {
    "Live News Feed": "Noticias en vivo",
    Sources: "Fuentes",
    "Fetching latest reports": "Cargando informes recientes",
    Translating: "Traduciendo",
    "No articles found": "No se encontraron artículos",
    "Unknown source": "Fuente desconocida",
    "Just now": "Ahora mismo",
    "Confirmed Cases:": "Casos confirmados:",
    "Deaths:": "Muertes:",
    "Countries Affected:": "Países afectados:",
    Confirmed: "Confirmado",
    Suspected: "Sospechoso",
    Monitoring: "Monitoreo",
    "Privacy Policy": "Privacidad",
  },
  nl: {
    "Live News Feed": "Live nieuws",
    Sources: "Bronnen",
    "Fetching latest reports": "Laatste berichten laden",
    Translating: "Vertalen",
    "No articles found": "Geen artikelen gevonden",
    "Unknown source": "Onbekende bron",
    "Just now": "Zojuist",
    "Confirmed Cases:": "Bevestigde gevallen:",
    "Deaths:": "Sterfgevallen:",
    "Countries Affected:": "Getroffen landen:",
    Confirmed: "Bevestigd",
    Suspected: "Verdacht",
    Monitoring: "Monitoring",
    "Privacy Policy": "Privacybeleid",
  },
  ar: {
    "Live News Feed": "موجز الأخبار المباشر",
    Sources: "المصادر",
    "Fetching latest reports": "جار تحميل أحدث التقارير",
    Translating: "جار الترجمة",
    "No articles found": "لم يتم العثور على مقالات",
    "Unknown source": "مصدر غير معروف",
    "Just now": "الآن",
    "Confirmed Cases:": "الحالات المؤكدة:",
    "Deaths:": "الوفيات:",
    "Countries Affected:": "الدول المتأثرة:",
    Confirmed: "مؤكد",
    Suspected: "مشتبه به",
    Monitoring: "تحت المراقبة",
    "Privacy Policy": "سياسة الخصوصية",
  },
};

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return LANGUAGE_OPTIONS.some((language) => language.code === value);
}

export function getSavedLanguage(): SupportedLanguage | null {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(savedLanguage) ? savedLanguage : null;
}

export function saveLanguage(language: SupportedLanguage) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function getLanguageLabel(language: SupportedLanguage) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.code === language)?.shortLabel ??
    language.toUpperCase()
  );
}

export function translateUiText(text: string, language: SupportedLanguage) {
  return TRANSLATIONS[language][text] ?? TRANSLATIONS.en[text] ?? text;
}

export async function detectLanguage(): Promise<SupportedLanguage> {
  const savedLanguage = getSavedLanguage();

  if (savedLanguage) {
    return savedLanguage;
  }

  try {
    const response = await fetch(IP_API_URL, { cache: "no-store" });

    if (!response.ok) {
      return "en";
    }

    const data = (await response.json()) as { country_code?: string };
    const countryCode = data.country_code?.toUpperCase();

    return countryCode ? COUNTRY_LANGUAGE_MAP[countryCode] ?? "en" : "en";
  } catch (error) {
    console.error("Language detection failed:", error);
    return "en";
  }
}

function getTranslationCacheKey(text: string, language: SupportedLanguage) {
  return `${TRANSLATION_CACHE_PREFIX}${language}.${text}`;
}

export async function translateText(
  text: string,
  language: SupportedLanguage,
): Promise<string> {
  if (language === "en" || !text.trim()) {
    return text;
  }

  const cacheKey = getTranslationCacheKey(text, language);
  const cachedTranslation = window.localStorage.getItem(cacheKey);

  if (cachedTranslation) {
    return cachedTranslation;
  }

  try {
    const url = new URL(MY_MEMORY_URL);
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `en|${language}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      return text;
    }

    const data = (await response.json()) as {
      responseData?: {
        translatedText?: string;
      };
    };
    const translatedText = data.responseData?.translatedText?.trim();

    if (!translatedText) {
      return text;
    }

    window.localStorage.setItem(cacheKey, translatedText);
    return translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}
