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
    "Suspected Cases:": "Suspected Cases:",
    "Deaths:": "Deaths:",
    "Countries Affected:": "Countries Affected:",
    Confirmed: "Confirmed Cases",
    Suspected: "Suspected Cases",
    Monitoring: "Under Monitoring",
    Deaths: "Deaths",
    Countries: "Countries",
    "Search countries...": "Search countries...",
    "No countries found": "No countries found",
    death: "death",
    deaths: "deaths",
    case: "case",
    cases: "cases",
    About: "About",
    "Privacy Policy": "Privacy Policy",
    "Learn More": "Learn More",
    "Prevention Guide": "Prevention Guide",
    "Last updated:": "Last updated:",
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
    "Suspected Cases:": "Verdachtsfälle:",
    "Deaths:": "Todesfälle:",
    "Countries Affected:": "Betroffene Länder:",
    Confirmed: "Bestätigte Fälle",
    Suspected: "Verdachtsfälle",
    Monitoring: "Unter Beobachtung",
    Deaths: "Todesfälle",
    Countries: "Länder",
    "Search countries...": "Länder suchen...",
    "No countries found": "Keine Länder gefunden",
    death: "Todesfall",
    deaths: "Todesfälle",
    case: "Fall",
    cases: "Fälle",
    About: "Über uns",
    "Privacy Policy": "Datenschutz",
    "Learn More": "Mehr erfahren",
    "Prevention Guide": "Präventionsratgeber",
    "Last updated:": "Zuletzt aktualisiert:",
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
    "Suspected Cases:": "Cas suspects :",
    "Deaths:": "Décès :",
    "Countries Affected:": "Pays touchés :",
    Confirmed: "Cas confirmés",
    Suspected: "Cas suspects",
    Monitoring: "Sous surveillance",
    Deaths: "Décès",
    Countries: "Pays",
    "Search countries...": "Rechercher des pays...",
    "No countries found": "Aucun pays trouvé",
    death: "décès",
    deaths: "décès",
    case: "cas",
    cases: "cas",
    About: "À propos",
    "Privacy Policy": "Confidentialité",
    "Learn More": "En savoir plus",
    "Prevention Guide": "Guide de prévention",
    "Last updated:": "Dernière mise à jour :",
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
    "Suspected Cases:": "Casos sospechosos:",
    "Deaths:": "Muertes:",
    "Countries Affected:": "Países afectados:",
    Confirmed: "Casos confirmados",
    Suspected: "Casos sospechosos",
    Monitoring: "Bajo vigilancia",
    Deaths: "Muertes",
    Countries: "Países",
    "Search countries...": "Buscar países...",
    "No countries found": "No se encontraron países",
    death: "muerte",
    deaths: "muertes",
    case: "caso",
    cases: "casos",
    About: "Acerca de",
    "Privacy Policy": "Privacidad",
    "Learn More": "Más información",
    "Prevention Guide": "Guía de prevención",
    "Last updated:": "Última actualización:",
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
    "Suspected Cases:": "Casos suspeitos:",
    "Deaths:": "Mortes:",
    "Countries Affected:": "Países afetados:",
    Confirmed: "Casos confirmados",
    Suspected: "Casos suspeitos",
    Monitoring: "Sob monitoramento",
    Deaths: "Mortes",
    Countries: "Países",
    "Search countries...": "Buscar países...",
    "No countries found": "Nenhum país encontrado",
    death: "morte",
    deaths: "mortes",
    case: "caso",
    cases: "casos",
    About: "Sobre",
    "Privacy Policy": "Política de privacidade",
    "Learn More": "Saiba mais",
    "Prevention Guide": "Guia de prevenção",
    "Last updated:": "Última atualização:",
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
    "Suspected Cases:": "Verdachte gevallen:",
    "Deaths:": "Sterfgevallen:",
    "Countries Affected:": "Getroffen landen:",
    Confirmed: "Bevestigde gevallen",
    Suspected: "Verdachte gevallen",
    Monitoring: "Onder bewaking",
    Deaths: "Sterfgevallen",
    Countries: "Landen",
    "Search countries...": "Landen zoeken...",
    "No countries found": "Geen landen gevonden",
    death: "sterfgeval",
    deaths: "sterfgevallen",
    case: "geval",
    cases: "gevallen",
    About: "Over ons",
    "Privacy Policy": "Privacybeleid",
    "Learn More": "Meer informatie",
    "Prevention Guide": "Preventiereeks",
    "Last updated:": "Laatste update:",
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
    "Suspected Cases:": "Подозреваемые случаи:",
    "Deaths:": "Смерти:",
    "Countries Affected:": "Пострадавшие страны:",
    Confirmed: "Подтверждённые случаи",
    Suspected: "Подозреваемые случаи",
    Monitoring: "Под наблюдением",
    Deaths: "Смерти",
    Countries: "Страны",
    "Search countries...": "Поиск стран...",
    "No countries found": "Страны не найдены",
    death: "смерть",
    deaths: "смертей",
    case: "случай",
    cases: "случаев",
    About: "О нас",
    "Privacy Policy": "Политика конфиденциальности",
    "Learn More": "Узнать больше",
    "Prevention Guide": "Руководство по профилактике",
    "Last updated:": "Последнее обновление:",
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
    "Suspected Cases:": "疑い症例数：",
    "Deaths:": "死者数：",
    "Countries Affected:": "影響を受けた国：",
    Confirmed: "確認済み症例",
    Suspected: "疑い症例",
    Monitoring: "監視下",
    Deaths: "死者",
    Countries: "国",
    "Search countries...": "国を検索...",
    "No countries found": "国が見つかりません",
    death: "死者",
    deaths: "死者",
    case: "症例",
    cases: "症例",
    About: "サイトについて",
    "Privacy Policy": "プライバシーポリシー",
    "Learn More": "詳細を見る",
    "Prevention Guide": "予防ガイド",
    "Last updated:": "最終更新：",
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
    "Suspected Cases:": "의심 사례:",
    "Deaths:": "사망자:",
    "Countries Affected:": "영향받은 국가:",
    Confirmed: "확진 사례",
    Suspected: "의심 사례",
    Monitoring: "모니터링 중",
    Deaths: "사망자",
    Countries: "국가",
    "Search countries...": "국가 검색...",
    "No countries found": "국가를 찾을 수 없음",
    death: "사망",
    deaths: "사망자",
    case: "사례",
    cases: "사례",
    About: "소개",
    "Privacy Policy": "개인정보 처리방침",
    "Learn More": "자세히 알아보기",
    "Prevention Guide": "예방 가이드",
    "Last updated:": "마지막 업데이트:",
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
    "Suspected Cases:": "الحالات المشتبه بها:",
    "Deaths:": "الوفيات:",
    "Countries Affected:": "الدول المتأثرة:",
    Confirmed: "حالات مؤكدة",
    Suspected: "حالات مشتبه بها",
    Monitoring: "تحت المراقبة",
    Deaths: "الوفيات",
    Countries: "الدول",
    "Search countries...": "ابحث عن الدول...",
    "No countries found": "لم يتم العثور على دول",
    death: "وفاة",
    deaths: "وفيات",
    case: "حالة",
    cases: "حالات",
    About: "حول الموقع",
    "Privacy Policy": "سياسة الخصوصية",
    "Learn More": "اعرف المزيد",
    "Prevention Guide": "دليل الوقاية",
    "Last updated:": "آخر تحديث:",
  },
};

export const COUNTRY_ISO_CODES: Record<string, string> = {
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

export function translateCountryName(name: string, language: SupportedLanguage): string {
  const code = COUNTRY_ISO_CODES[name];
  if (!code) return name;
  try {
    return new Intl.DisplayNames([language], { type: "region" }).of(code) ?? name;
  } catch {
    return name;
  }
}

const ALL_LANGUAGES: SupportedLanguage[] = ["en", "de", "fr", "es", "nl", "ar", "ru", "ja", "pt", "ko"];

export function countryMatchesSearch(name: string, query: string): boolean {
  const q = query.toLowerCase();
  if (name.toLowerCase().includes(q)) return true;
  const code = COUNTRY_ISO_CODES[name];
  if (!code) return false;
  for (const lang of ALL_LANGUAGES) {
    try {
      const translated = new Intl.DisplayNames([lang], { type: "region" }).of(code);
      if (translated?.toLowerCase().includes(q)) return true;
    } catch {
      // skip
    }
  }
  return false;
}

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
