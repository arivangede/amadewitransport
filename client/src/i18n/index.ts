import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Every JSON file under ./locales/<lang>/<namespace>.json is picked up
// automatically. Adding a language = adding a folder with the same files.
const files = import.meta.glob<{ default: Record<string, unknown> }>(
  "./locales/*/*.json",
  { eager: true },
);

type Resources = Record<string, Record<string, Record<string, unknown>>>;

const resources = Object.entries(files).reduce<Resources>((acc, [path, mod]) => {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) return acc;
  const [, lang, ns] = match;
  acc[lang] = acc[lang] ?? {};
  acc[lang][ns] = mod.default;
  return acc;
}, {});

export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = Object.keys(resources).sort((a, b) =>
  a === DEFAULT_LANGUAGE ? -1 : b === DEFAULT_LANGUAGE ? 1 : a.localeCompare(b),
);

// BCP 47 tags used for Intl number/date formatting per language.
const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  id: "id-ID",
};

export function intlLocale(lang: string) {
  return INTL_LOCALES[lang] ?? lang;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    ns: ["common", "home", "packages", "pages"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnObjects: true,
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "amadewi_lang",
      caches: ["localStorage"],
    },
  });

function syncDocument(lang: string) {
  document.documentElement.lang = lang;
}

syncDocument(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", (lang) => syncDocument(i18n.resolvedLanguage ?? lang));

export default i18n;
