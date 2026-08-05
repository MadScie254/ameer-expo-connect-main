import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import sw from "../locales/sw.json";

const staticLocales: Record<string, Record<string, string>> = { en, fr, ar, sw };
const memoryCache: Record<string, Record<string, string>> = { en: {}, fr: {}, ar: {}, sw: {} };

// ──────────────────────────────────────────────────────────────────────────────
// getTranslations — Returns all static + cached translations for a language
// ──────────────────────────────────────────────────────────────────────────────
export const getTranslations = createServerFn({ method: "GET" })
  .validator((lang: unknown) => z.string().parse(lang))
  .handler(async ({ data: lang }) => {
    return {
      ...(staticLocales[lang] || {}),
      ...(memoryCache[lang] || {}),
    };
  });

// ──────────────────────────────────────────────────────────────────────────────
// translateAndCache — Dynamically translates a single string via Azure
// ──────────────────────────────────────────────────────────────────────────────
export const translateAndCache = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ lang: z.string(), key: z.string() }).parse(d))
  .handler(async ({ data: { lang, key } }) => {
    // 1. If it's English, no translation needed.
    if (lang === "en") return key;

    // 2. Check if we already have it in static or cache (race condition safeguard)
    if (staticLocales[lang]?.[key]) return staticLocales[lang][key];
    if (memoryCache[lang]?.[key]) return memoryCache[lang][key];

    // 3. Call Azure Cognitive Services Translator
    const azureKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION || "global";

    if (!azureKey) {
      console.warn("AZURE_TRANSLATOR_KEY missing. Falling back to English for:", key);
      return key;
    }

    try {
      const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=${lang}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: key }]),
      });

      if (!res.ok) {
        console.error("Azure translate error:", await res.text());
        return key;
      }

      const data = await res.json();
      const translated = data[0]?.translations[0]?.text || key;

      // 4. Save to in-memory cache
      if (!memoryCache[lang]) memoryCache[lang] = {};
      memoryCache[lang][key] = translated;

      return translated;
    } catch (e) {
      console.error("Failed to call Azure translator:", e);
      return key;
    }
  });
