import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getTranslations, translateAndCache } from "../server/translate";

// This file is executed on both client and server (if SSR is active).
// In a full SSR i18next setup, you'd want an instance per request.
// For simplicity, we configure a singleton here that initializes async.
// It uses our TanStack server functions as a custom backend.

const customBackend = {
  type: "backend" as const,
  read: async (
    language: string,
    namespace: string,
    callback: (err: unknown, data: unknown) => void,
  ) => {
    try {
      const data = await getTranslations({ data: language });
      callback(null, data);
    } catch (err) {
      callback(err, null);
    }
  },
  create: async (languages: string[], namespace: string, key: string, fallbackValue: string) => {
    // Called when a key is missing
    for (const lang of languages) {
      if (lang === "en") continue;
      try {
        const translated = await translateAndCache({ data: { lang, key } });
        // Tell i18next about the new resource so it updates the UI
        i18n.addResource(lang, namespace, key, translated);
      } catch (err) {
        console.error("Failed to dynamically translate:", err);
      }
    }
  },
};

i18n
  .use(customBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "ar", "sw"],
    ns: ["translation"],
    defaultNS: "translation",

    // Trigger `create` for missing keys
    saveMissing: true,
    saveMissingTo: "current",
    missingKeyNoValueFallbackToKey: true,

    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
