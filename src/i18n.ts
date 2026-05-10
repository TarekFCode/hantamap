export type SupportedLanguage =
  | "en"
  | "de"
  | "fr"
  | "es"
  | "nl"
  | "ar"
  | "ru"
  | "ja"
  | "pt"
  | "ko";

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
  { code: "pt", label: "Português", shortLabel: "PT" },
  { code: "nl", label: "Nederlands", shortLabel: "NL" },
  { code: "ru", label: "Русский", shortLabel: "RU" },
  { code: "ja", label: "日本語", shortLabel: "JA" },
  { code: "ko", label: "한국어", shortLabel: "KO" },
  { code: "ar", label: "العربية", shortLabel: "AR" },
];

const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // German
  AT: "de",
  CH: "de",
  DE: "de",
  // French
  BE: "fr",
  FR: "fr",
  LU: "fr",
  // Spanish
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  BO: "es",
  PY: "es",
  UY: "es",
  // Portuguese
  BR: "pt",
  PT: "pt",
  AO: "pt",
  MZ: "pt",
  // Dutch
  NL: "nl",
  // Russian
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  // Japanese
  JP: "ja",
  // Korean
  KR: "ko",
  // Arabic
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
    "Learn More": "Learn More",
    "Prevention Guide": "Prevention Guide",
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
    "Learn More": "Mehr erfahren",
    "Prevention Guide": "Präventionsratgeber",
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
    "Learn More": "En savoir plus",
    "Prevention Guide": "Guide de prévention",
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
    "Learn More": "Más información",
    "Prevention Guide": "Guía de prevención",
  },
  pt: {
    "Live News Feed": "Notícias ao vivo",
    Sources: "Fontes",
    "Fetching latest reports": "Carregando relatórios recentes",
    Translating: "Traduzindo",
    "No articles found": "Nenhum artigo encontrado",
    "Unknown source": "Fonte desconhecida",
    "Just now": "Agora mesmo",
    "Confirmed Cases:": "Casos confirmados:",
    "Deaths:": "Mortes:",
    "Countries Affected:": "Países afetados:",
    Confirmed: "Confirmado",
    Suspected: "Suspeito",
    Monitoring: "Monitoramento",
    "Privacy Policy": "Política de privacidade",
    "Learn More": "Saiba mais",
    "Prevention Guide": "Guia de prevenção",
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
    "Learn More": "Meer informatie",
    "Prevention Guide": "Preventiereeks",
  },
  ru: {
    "Live News Feed": "Прямая лента новостей",
    Sources: "Источники",
    "Fetching latest reports": "Загрузка последних отчётов",
    Translating: "Перевод",
    "No articles found": "Статьи не найдены",
    "Unknown source": "Неизвестный источник",
    "Just now": "Только что",
    "Confirmed Cases:": "Подтверждённые случаи:",
    "Deaths:": "Смерти:",
    "Countries Affected:": "Пострадавшие страны:",
    Confirmed: "Подтверждено",
    Suspected: "Подозреваемый",
    Monitoring: "Мониторинг",
    "Privacy Policy": "Политика конфиденциальности",
    "Learn More": "Узнать больше",
    "Prevention Guide": "Руководство по профилактике",
  },
  ja: {
    "Live News Feed": "ライブニュースフィード",
    Sources: "情報源",
    "Fetching latest reports": "最新レポートを取得中",
    Translating: "翻訳中",
    "No articles found": "記事が見つかりません",
    "Unknown source": "不明なソース",
    "Just now": "たった今",
    "Confirmed Cases:": "確認症例数：",
    "Deaths:": "死者数：",
    "Countries Affected:": "影響を受けた国：",
    Confirmed: "確認済み",
    Suspected: "疑い例",
    Monitoring: "監視中",
    "Privacy Policy": "プライバシーポリシー",
    "Learn More": "詳細を見る",
    "Prevention Guide": "予防ガイド",
  },
  ko: {
    "Live News Feed": "실시간 뉴스 피드",
    Sources: "출처",
    "Fetching latest reports": "최신 보고서 불러오는 중",
    Translating: "번역 중",
    "No articles found": "기사를 찾을 수 없음",
    "Unknown source": "알 수 없는 출처",
    "Just now": "방금",
    "Confirmed Cases:": "확진 사례:",
    "Deaths:": "사망자:",
    "Countries Affected:": "영향받은 국가:",
    Confirmed: "확진",
    Suspected: "의심",
    Monitoring: "모니터링",
    "Privacy Policy": "개인정보 처리방침",
    "Learn More": "자세히 알아보기",
    "Prevention Guide": "예방 가이드",
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
    "Learn More": "اعرف المزيد",
    "Prevention Guide": "دليل الوقاية",
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
