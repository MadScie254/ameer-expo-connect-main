import { Globe, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import i18n from "../../lib/i18n";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", country: "gb" },
  { code: "ar", label: "Arabic", country: "sa" },
  { code: "sw", label: "Swahili", country: "ke" },
  { code: "fr", label: "French", country: "fr" },
];

export function LanguageSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18nInstance.language || "en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync React state when i18n language changes
    const handleLangChange = (lng: string) => {
      setCurrentLang(lng);
      document.documentElement.lang = lng;
    };

    i18nInstance.on("languageChanged", handleLangChange);

    // Load initial from cookie
    const match = document.cookie.match(/(?:^|;)\s*AMEER_LANG=([^;]*)/);
    if (match && match[1]) {
      const lng = match[1];
      if (lng !== i18nInstance.language) {
        i18nInstance.changeLanguage(lng);
      } else {
        document.documentElement.lang = lng;
      }
    }

    const clickHandler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickHandler);
    return () => {
      document.removeEventListener("mousedown", clickHandler);
      i18nInstance.off("languageChanged", handleLangChange);
    };
  }, [i18nInstance]);

  const changeLanguage = (code: string) => {
    document.cookie = `AMEER_LANG=${code}; path=/; max-age=31536000`;
    document.documentElement.lang = code;
    i18nInstance.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Inline Strip for xl screens */}
      <div className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-border/40">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            title={lang.label}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all overflow-hidden border border-border/20 ${
              currentLang === lang.code
                ? "shadow-glow scale-110 border-primary"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={`https://flagcdn.com/w40/${lang.country}.png`}
              alt={lang.label}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Dropdown for smaller screens */}
      <div className="xl:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-border/40 hover:bg-white/10 transition-colors"
          aria-label="Change Language"
        >
          {currentLang === "en" ? (
            <Globe size={18} className="text-foreground" />
          ) : (
            <img
              src={`https://flagcdn.com/w40/${LANGUAGES.find((l) => l.code === currentLang)?.country}.png`}
              alt={currentLang}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-card border border-border/60 shadow-elegant z-50 max-h-[70vh] overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors hover:bg-secondary/50 ${
                  currentLang === lang.code
                    ? "text-primary font-medium bg-primary/5"
                    : "text-foreground"
                }`}
              >
                <img
                  src={`https://flagcdn.com/w40/${lang.country}.png`}
                  alt={lang.label}
                  className="w-5 h-5 rounded-full object-cover border border-border/20"
                />
                <span className="flex-1">{lang.label}</span>
                {currentLang === lang.code && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
