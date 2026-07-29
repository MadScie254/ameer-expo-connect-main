import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/ameer-expo-logo.png.asset.json";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const links = [
  { label: "About", href: "#about" },
  { label: "Why Attend", href: "#why" },
  { label: "Venue", href: "#venue" },
  { label: "Speakers", href: "#speakers" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all ${
            scrolled ? "glass shadow-soft" : "glass-dark"
          }`}
        >
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <img
              src={logo.url}
              alt="Ameer Expo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain shrink-0"
            />
            <div className="min-w-0 leading-tight">
              <div
                className={`font-display font-bold text-sm sm:text-base truncate ${
                  scrolled ? "text-foreground" : "text-white"
                }`}
              >
                Ameer Expo
              </div>
              <div
                className={`text-[10px] uppercase tracking-[0.18em] ${
                  scrolled ? "text-muted-foreground" : "text-white/70"
                }`}
              >
                Africa & Middle East 2026
              </div>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-glow hover:shadow-elegant transition-all hover:-translate-y-0.5"
            >
              Register
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className={`lg:hidden p-2 rounded-lg ${scrolled ? "text-foreground" : "text-white"}`}
              aria-label="Menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="lg:hidden mt-2 glass rounded-2xl p-3 shadow-soft animate-in fade-in slide-in-from-top-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground/80 hover:bg-primary/5"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/register"
              className="mt-2 block text-center rounded-xl bg-gradient-gold px-5 py-3 text-sm font-semibold text-gold-foreground"
            >
              Register Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
