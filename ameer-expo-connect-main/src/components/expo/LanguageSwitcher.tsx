import { Globe, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const LANGUAGES = [
  { code: "en", label: "English", country: "gb" },
  { code: "ar", label: "Arabic", country: "sa" },
  { code: "so", label: "Somali", country: "so" },
  { code: "sw", label: "Swahili", country: "ke" },
  { code: "tr", label: "Turkish", country: "tr" },
  { code: "fr", label: "French", country: "fr" },
  { code: "de", label: "German", country: "de" },
  { code: "it", label: "Italian", country: "it" },
  { code: "es", label: "Spanish", country: "es" },
  { code: "pt", label: "Portuguese", country: "pt" },
  { code: "nl", label: "Dutch", country: "nl" },
  { code: "el", label: "Greek", country: "gr" },
  { code: "ru", label: "Russian", country: "ru" },
  { code: "zh-CN", label: "Chinese", country: "cn" },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load language from cookie if available and inject script
  useEffect(() => {
    // Inject Google Translate script safely
    if (!document.getElementById("google-translate-script")) {
      (window as any).googleTranslateElementInit = function () {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar,so,sw,tr,fr,de,it,es,pt,nl,el,ru,zh-CN",
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match) {
      const parts = match[1].split("/");
      if (parts.length > 2) {
        setCurrentLang(parts[2]);
      }
    }

    const clickHandler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, []);

  const changeLanguage = (code: string) => {
    if (code === "en") {
      // Reset logic
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname + ";";
      document.documentElement.dir = "ltr";
      window.location.reload();
      return;
    }

    // Set the Google Translate cookie manually for guaranteed initialization
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=.${window.location.hostname}`;

    setCurrentLang(code);
    
    // Keep LTR even for Arabic to preserve existing spacing/alignment
    // Note: Full RTL support is a separate future task.
    document.documentElement.dir = "ltr"; 
    setIsOpen(false);
    
    // Reload to let the Google Translate script pick up the new cookie and apply cleanly
    window.location.reload();
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* 
        Note for testing: 
        After selecting a language, navigate between routes using the app links
        to confirm Google Translate catches the new DOM rendered by TanStack Router.
      */}

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
