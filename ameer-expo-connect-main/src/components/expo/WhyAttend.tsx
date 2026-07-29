import {
  Network,
  TrendingUp,
  Briefcase,
  Landmark,
  Cpu,
  Lightbulb,
  Factory,
  ShoppingBag,
  Building,
  Plane,
  Wheat,
  HeartPulse,
  GraduationCap,
  Zap,
  HardHat,
} from "lucide-react";

const items = [
  { icon: Network, title: "Networking", desc: "Meet 15,000+ decision-makers." },
  { icon: TrendingUp, title: "Investment", desc: "Access qualified capital." },
  { icon: Briefcase, title: "Business Matching", desc: "Curated 1:1 meetings." },
  { icon: Landmark, title: "Government Delegations", desc: "Bilateral pavilions." },
  { icon: Cpu, title: "Technology Showcase", desc: "See what's next." },
  { icon: Lightbulb, title: "Innovation", desc: "Startup launchpads." },
  { icon: Factory, title: "Manufacturing", desc: "OEM & industrial partners." },
  { icon: ShoppingBag, title: "Trade", desc: "Import / export deals." },
  { icon: Building, title: "Real Estate", desc: "Prime development projects." },
  { icon: Plane, title: "Tourism", desc: "Destination partnerships." },
  { icon: Wheat, title: "Agriculture", desc: "Agri-tech & agribusiness." },
  { icon: HeartPulse, title: "Healthcare", desc: "MedTech & pharma." },
  { icon: GraduationCap, title: "Education", desc: "EdTech & institutions." },
  { icon: Zap, title: "Energy", desc: "Renewables & power." },
  { icon: HardHat, title: "Construction", desc: "Infrastructure at scale." },
];

export function WhyAttend() {
  return (
    <section id="why" className="relative py-24 sm:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
              Why Attend
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-foreground">
              Fifteen reasons to be <span className="text-gradient-gold">on the floor</span>.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Every sector, every deal-maker, every currency of the region — under one roof for 72
            hours.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 border border-border/60 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
                  <it.icon size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-foreground">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
