import { Link } from "@tanstack/react-router";
import { Building2, Handshake, ArrowRight, Check } from "lucide-react";

const booths = [
  { size: "6 sqm", price: "From $1,800" },
  { size: "9 sqm", price: "From $2,600" },
  { size: "18 sqm", price: "From $4,900" },
  { size: "36 sqm", price: "From $9,400" },
  { size: "Custom", price: "On request" },
];

const packages = [
  {
    tier: "Diamond",
    accent: true,
    perks: ["Keynote slot", "Main-stage branding", "20 delegate passes", "Premium 36 sqm booth"],
  },
  {
    tier: "Platinum",
    perks: ["Panel session", "Hall branding", "12 delegate passes", "18 sqm booth"],
  },
  {
    tier: "Gold",
    perks: ["Workshop slot", "Registration branding", "8 delegate passes", "9 sqm booth"],
  },
  { tier: "Silver", perks: ["Logo on collateral", "5 delegate passes", "6 sqm booth"] },
  { tier: "Bronze", perks: ["Logo on website", "3 delegate passes", "Shared booth"] },
];

export function ExhibitorSponsor() {
  return (
    <>
      <section id="exhibit" className="relative py-24 sm:py-32 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
                Exhibit
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">
                Reserve your <span className="text-gradient-gold">stand</span>.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Shell scheme or fully custom builds — with power, internet, furniture add-ons and
                instant quotation. Reserve now to secure premium hall positioning.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:-translate-y-0.5 transition-transform"
              >
                <Building2 size={18} /> Reserve a Booth
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {booths.map((b) => (
                <div
                  key={b.size}
                  className="rounded-2xl bg-card p-5 border border-border/60 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all"
                >
                  <div className="font-display text-2xl font-bold text-foreground">{b.size}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{b.price}</div>
                  <div className="mt-4 h-1 w-10 rounded-full bg-gradient-gold" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="sponsor" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
              Sponsorship
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">
              Put your brand <span className="text-gradient-gold">centre stage</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Five packages engineered for reach, prestige and lead generation.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {packages.map((p) => (
              <div
                key={p.tier}
                className={`relative rounded-2xl p-6 border transition-all hover:-translate-y-1 ${
                  p.accent
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-elegant"
                    : "bg-card border-border/60 shadow-soft"
                }`}
              >
                {p.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-foreground">
                    Flagship
                  </div>
                )}
                <div
                  className={`font-display text-xl font-bold ${
                    p.accent ? "text-gold" : "text-foreground"
                  }`}
                >
                  {p.tier}
                </div>
                <ul
                  className={`mt-4 space-y-2 text-sm ${p.accent ? "text-white/85" : "text-muted-foreground"}`}
                >
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${p.accent ? "text-gold" : "text-primary"}`}
                      />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${
                    p.accent ? "text-gold" : "text-primary"
                  } hover:gap-3 transition-all`}
                >
                  <Handshake size={16} /> Choose {p.tier}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
