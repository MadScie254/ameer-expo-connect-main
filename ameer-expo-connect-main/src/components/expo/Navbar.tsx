import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/ameer-expo-logo.png";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const links = [
  { label: "About", to: "/", hash: "about" },
  { label: "Why Attend", to: "/", hash: "why" },
  { label: "Exhibitors & Map", to: "/floor-plan" },
  { label: "Schedule & Agenda", to: "/schedule" },
  { label: "Networking", to: "/attendees" },
  { label: "Venue", to: "/", hash: "venue" },
  { label: "Speakers", to: "/", hash: "speakers" },
  { label: "FAQ", to: "/", hash: "faq" },
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 transition-all duration-500 ${
        open ? "z-[100]" : "z-50"
      } ${scrolled && !open ? "py-2" : "py-4"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all ${
            open ? "opacity-0 pointer-events-none" : scrolled ? "glass shadow-soft" : "glass-dark"
          }`}
        >
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={logo}
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
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                hash={l.hash}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-glow hover:shadow-elegant transition-all hover:-translate-y-0.5"
            >
              Visitor Pass
            </Link>
            <button
              onClick={() => setOpen(true)}
              className={`lg:hidden p-2 rounded-lg ${scrolled ? "text-foreground" : "text-white"}`}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>

        {/* Mobile Full Screen Menu */}
        {open && (
          <div className="fixed inset-0 z-[100] bg-background overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col min-h-screen px-6 py-4">
              {/* Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/"
                  className="flex items-center gap-3 min-w-0"
                  onClick={() => setOpen(false)}
                >
                  <img
                    src={logo}
                    alt="Ameer Expo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain shrink-0"
                  />
                  <div className="min-w-0 leading-tight">
                    <div className="font-display font-bold text-sm sm:text-base text-foreground truncate">
                      Ameer Expo
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Africa & Middle East 2026
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 -mr-2 rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    hash={l.hash}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-4 rounded-xl text-lg font-semibold text-foreground hover:bg-accent/50 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="h-px bg-border my-6 opacity-50" />

              {/* Menu Action Buttons */}
              <div className="flex flex-col gap-4 mt-auto mb-8">
                <div className="px-2">
                  <LanguageSwitcher />
                </div>
                <Link
                  to="/exhibit"
                  onClick={() => setOpen(false)}
                  className="w-full text-center rounded-xl bg-accent px-5 py-4 text-base font-semibold text-foreground hover:bg-accent/80 transition-colors"
                >
                  Exhibit / Sponsor
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="w-full text-center rounded-xl bg-gradient-gold px-5 py-4 text-base font-semibold text-gold-foreground shadow-glow"
                >
                  Get Visitor Pass
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
