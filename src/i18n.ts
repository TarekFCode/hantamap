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
const TRANSLATION_CACHE_PREFIX = "hantatracker.translation.";

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
