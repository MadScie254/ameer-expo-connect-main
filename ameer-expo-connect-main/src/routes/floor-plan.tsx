import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/expo/Navbar";
import { Footer } from "@/components/expo/Footer";
import { Search, MapPin, Building2, User, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/floor-plan")({
  component: FloorPlan,
  head: () => ({
    meta: [
      { title: "Floor Plan & Exhibitors | Ameer Expo 2026" },
      {
        name: "description",
        content:
          "Interactive floor plan and exhibitor directory for Ameer Expo Africa & Middle East 2026.",
      },
    ],
  }),
});

// Mock data for exhibitors
const MOCK_EXHIBITORS = [
  { id: "b1", name: "TechNova Solutions", category: "Technology", booth: "A-12" },
  { id: "b2", name: "AgriGrow Kenya", category: "Agriculture", booth: "A-14" },
  { id: "b3", name: "EcoBuild Materials", category: "Construction", booth: "B-01" },
  { id: "b4", name: "FinTech Africa", category: "Finance", booth: "B-05" },
  { id: "b5", name: "Global Logistics Ltd", category: "Transport", booth: "C-10" },
  { id: "b6", name: "Smart Health Systems", category: "Healthcare", booth: "C-12" },
  { id: "b7", name: "Solaris Energy", category: "Energy", booth: "D-20" },
  { id: "b8", name: "Ameer Group", category: "Investment", booth: "VIP-1" },
];

function FloorPlan() {
  const [search, setSearch] = useState("");
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);

  const filteredExhibitors = MOCK_EXHIBITORS.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.booth.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-[104px] pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-[calc(100vh-140px)] min-h-[600px] flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Directory */}
          <div className="w-full lg:w-96 flex flex-col gap-4 bg-card rounded-3xl border border-border/60 shadow-elegant p-5 flex-shrink-0">
            <div>
              <h1 className="font-display text-2xl font-bold">Exhibitor Directory</h1>
              <p className="text-sm text-muted-foreground mt-1">Find booths at Sarit Expo Centre</p>
            </div>

            <div className="relative mt-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Search exhibitors, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-secondary/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-2">
              {filteredExhibitors.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No exhibitors found.
                </div>
              ) : (
                filteredExhibitors.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedBooth(ex.booth)}
                    className={`w-full flex items-center justify-between text-left p-3 rounded-xl border transition-all ${
                      selectedBooth === ex.booth
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground">{ex.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Building2 size={12} /> {ex.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold bg-secondary px-2 py-1 rounded-md text-foreground">
                        {ex.booth}
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Area - Interactive Map */}
          <div className="flex-1 bg-card rounded-3xl border border-border/60 shadow-elegant overflow-hidden flex flex-col relative">
            <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold border border-border/50 shadow-sm flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Sarit Expo Centre - Ground Floor
            </div>

            {/* Simple SVG Map Placeholder */}
            <div className="flex-1 w-full h-full p-4 overflow-auto relative grid place-items-center bg-[#f8fafc] dark:bg-black/20">
              <div className="min-w-[800px] min-h-[600px] w-full h-full flex items-center justify-center p-12">
                <svg
                  viewBox="0 0 800 600"
                  className="w-full h-full max-w-full drop-shadow-xl"
                  style={{ filter: "drop-shadow(0 20px 13px rgb(0 0 0 / 0.05))" }}
                >
                  {/* Outer Building */}
                  <rect
                    x="50"
                    y="50"
                    width="700"
                    height="500"
                    rx="20"
                    fill="currentColor"
                    className="text-white dark:text-gray-900"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="10 10"
                  />
                  <text
                    x="400"
                    y="90"
                    textAnchor="middle"
                    className="fill-muted-foreground text-xl font-display font-bold uppercase tracking-widest opacity-50"
                  >
                    Entrance
                  </text>
                  <path
                    d="M 350 50 L 450 50"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth="8"
                  />

                  {/* Booths Definition */}
                  <g>
                    {/* Zone A */}
                    <rect
                      x="100"
                      y="150"
                      width="80"
                      height="60"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "A-12" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("A-12")}
                    />
                    <text
                      x="140"
                      y="185"
                      textAnchor="middle"
                      className={`text-xs font-bold ${selectedBooth === "A-12" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      A-12
                    </text>

                    <rect
                      x="200"
                      y="150"
                      width="80"
                      height="60"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "A-14" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("A-14")}
                    />
                    <text
                      x="240"
                      y="185"
                      textAnchor="middle"
                      className={`text-xs font-bold ${selectedBooth === "A-14" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      A-14
                    </text>

                    {/* Zone B */}
                    <rect
                      x="100"
                      y="250"
                      width="120"
                      height="80"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "B-01" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("B-01")}
                    />
                    <text
                      x="160"
                      y="295"
                      textAnchor="middle"
                      className={`text-xs font-bold ${selectedBooth === "B-01" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      B-01
                    </text>

                    <rect
                      x="240"
                      y="250"
                      width="120"
                      height="80"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "B-05" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("B-05")}
                    />
                    <text
                      x="300"
                      y="295"
                      textAnchor="middle"
                      className={`text-xs font-bold ${selectedBooth === "B-05" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      B-05
                    </text>

                    {/* Zone C */}
                    <rect
                      x="500"
                      y="150"
                      width="80"
                      height="60"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "C-10" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("C-10")}
                    />
                    <text
                      x="540"
                      y="185"
                      textAnchor="middle"
                      className={`text-xs font-bold ${selectedBooth === "C-10" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      C-10
                    </text>

                    <rect
                      x="600"
                      y="150"
                      width="80"
                      height="60"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "C-12" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("C-12")}
                    />
                    <text
                      x="640"
                      y="185"
                      textAnchor="middle"
                      className={`text-xs font-bold ${selectedBooth === "C-12" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      C-12
                    </text>

                    {/* Zone D */}
                    <rect
                      x="500"
                      y="250"
                      width="180"
                      height="120"
                      rx="8"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "D-20" ? "fill-primary" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("D-20")}
                    />
                    <text
                      x="590"
                      y="315"
                      textAnchor="middle"
                      className={`text-base font-bold ${selectedBooth === "D-20" ? "fill-primary-foreground" : "fill-foreground"}`}
                    >
                      D-20
                    </text>

                    {/* VIP Area */}
                    <rect
                      x="300"
                      y="400"
                      width="200"
                      height="100"
                      rx="12"
                      className={`transition-all duration-300 cursor-pointer ${selectedBooth === "VIP-1" ? "fill-[url(#gold-grad)]" : "fill-secondary hover:fill-primary/20"}`}
                      onClick={() => setSelectedBooth("VIP-1")}
                      stroke="#d4af37"
                      strokeWidth="2"
                    />
                    <text
                      x="400"
                      y="455"
                      textAnchor="middle"
                      className={`text-lg font-bold font-display ${selectedBooth === "VIP-1" ? "fill-white" : "fill-foreground"}`}
                    >
                      VIP-1 (Ameer Group)
                    </text>

                    <defs>
                      <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#bf953f" />
                        <stop offset="50%" stopColor="#fcf6ba" />
                        <stop offset="100%" stopColor="#b38728" />
                      </linearGradient>
                    </defs>
                  </g>
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-card border-t border-border/60 p-4 flex gap-6 justify-center text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-secondary block border border-border"></span>{" "}
                Available
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-primary block"></span> Selected
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#bf953f] block"></span> VIP / Premium
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
