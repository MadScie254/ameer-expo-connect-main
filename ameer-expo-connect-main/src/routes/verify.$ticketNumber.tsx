import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getTicketStatus, confirmCheckIn } from "../server/verify";
import {
  ShieldX,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Ticket,
  User,
  Clock,
  KeyRound,
} from "lucide-react";

export const Route = createFileRoute("/verify/$ticketNumber")({
  component: VerifyPage,
  head: ({ params }) => ({
    meta: [
      { title: `Ticket Verification · Ameer Expo 2026` },
      {
        name: "description",
        content: `Staff ticket verification for ${params.ticketNumber}`,
      },
      // Prevent bots from indexing verification pages
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// ── PIN sessionStorage key (persists across scans during a shift) ─────────────
const PIN_SESSION_KEY = "ameer-expo-staff-pin";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date(iso));
}

function passLabel(passType: string): string {
  return passType === "vip" ? "VIP Pass" : "General Admission";
}

// ── Screen state machine ──────────────────────────────────────────────────────
type Screen =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "not_valid" }
  | {
      kind: "ready";
      firstName: string;
      lastName: string;
      passType: string;
    }
  | {
      kind: "success";
      firstName: string;
      passType: string;
    }
  | {
      kind: "already_used";
      checkedInAt: string | null;
    }
  | { kind: "error"; message: string };

function VerifyPage() {
  const { ticketNumber } = Route.useParams();

  const [screen, setScreen] = useState<Screen>({ kind: "loading" });
  const [pin, setPin] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // ── Load cached PIN from session on mount ───────────────────────────────────
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(PIN_SESSION_KEY);
      if (cached) setPin(cached);
    } catch {
      /* ignore */
    }
  }, []);

  // ── Fetch ticket status on mount (READ ONLY — no side effects) ──────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getTicketStatus({ data: ticketNumber });
        if (cancelled) return;

        if (!result.found) {
          setScreen({ kind: "not_found" });
          return;
        }

        if (!result.eventValid) {
          setScreen({ kind: "not_valid" });
          return;
        }

        if (result.checkedIn) {
          setScreen({ kind: "already_used", checkedInAt: result.checkedInAt });
          return;
        }

        setScreen({
          kind: "ready",
          firstName: result.firstName,
          lastName: result.lastName,
          passType: result.passType,
        });
      } catch {
        if (cancelled) return;
        setScreen({
          kind: "error",
          message: "Could not load ticket. Please check your connection.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticketNumber]);

  // ── Check-in handler (PIN-gated — the only DB write) ───────────────────────
  const handleCheckIn = async () => {
    if (!pin.trim()) {
      setPinError("Enter staff PIN to continue.");
      pinInputRef.current?.focus();
      return;
    }
    setPinError(null);
    setIsChecking(true);

    try {
      const result = await confirmCheckIn({ data: { ticketNumber, pin } });

      if (result.success) {
        // Cache PIN so staff don't re-enter it for every scan this shift
        try {
          sessionStorage.setItem(PIN_SESSION_KEY, pin);
        } catch {
          /* ignore */
        }
        setScreen({
          kind: "success",
          firstName: (screen as { firstName: string }).firstName,
          passType: (screen as { passType: string }).passType,
        });
        return;
      }

      if (result.reason === "invalid_pin") {
        setPinError("Incorrect PIN. Please try again.");
        return;
      }

      if (result.reason === "already_checked_in") {
        setScreen({ kind: "already_used", checkedInAt: result.checkedInAt });
        return;
      }

      setPinError("Check-in failed. Please try again.");
    } catch {
      setPinError("Network error. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col items-center justify-center px-4 py-12">
      {/* ── Loading ── */}
      {screen.kind === "loading" && (
        <div className="rounded-2xl bg-card border border-border/60 shadow-elegant p-10 text-center max-w-sm w-full">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading ticket…</p>
        </div>
      )}

      {/* ── Not found ── */}
      {screen.kind === "not_found" && (
        <StatusCard
          icon={ShieldX}
          iconClass="bg-destructive/10 text-destructive"
          title="Invalid Ticket"
          description="No ticket found with this number. Please check the QR code and try again."
          borderClass="border-destructive/40"
        />
      )}

      {/* ── Not valid (payment pending) ── */}
      {screen.kind === "not_valid" && (
        <StatusCard
          icon={AlertTriangle}
          iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Ticket Not Active"
          description="This ticket is not yet active. Payment confirmation may still be pending."
          borderClass="border-amber-400/40"
        />
      )}

      {/* ── Error ── */}
      {screen.kind === "error" && (
        <StatusCard
          icon={ShieldX}
          iconClass="bg-destructive/10 text-destructive"
          title="Something went wrong"
          description={screen.message}
          borderClass="border-destructive/40"
        />
      )}

      {/* ── Already checked in ── */}
      {screen.kind === "already_used" && (
        <div className="rounded-2xl bg-card border-2 border-amber-400/50 shadow-elegant p-10 text-center max-w-sm w-full">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Already Checked In
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            This ticket was already used for entry.
          </p>
          {screen.checkedInAt && (
            <div className="rounded-xl border border-border/60 bg-secondary/50 px-4 py-3 text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock size={14} className="shrink-0" />
                <span>Checked in at {formatTime(screen.checkedInAt)}</span>
              </div>
            </div>
          )}
          <p className="mt-5 text-xs text-muted-foreground">
            Do not admit this person — the ticket has already been used.
          </p>
        </div>
      )}

      {/* ── Ready to check in ── */}
      {screen.kind === "ready" && (
        <div className="rounded-2xl bg-card border border-border/60 shadow-elegant p-8 max-w-sm w-full space-y-6">
          {/* Attendee summary — large, high-contrast for daylight scanning */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={30} />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
              {screen.firstName} {screen.lastName}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm font-semibold text-foreground">
              <Ticket size={14} className="text-primary shrink-0" />
              {passLabel(screen.passType)}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-border/60" />

          {/* Ticket number */}
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Ticket
            </div>
            <div className="font-mono text-base font-bold text-primary tracking-wider">
              {ticketNumber}
            </div>
          </div>

          {/* PIN input */}
          <div className="space-y-2">
            <label
              htmlFor="staff-pin"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              <KeyRound size={13} />
              Staff PIN
            </label>
            <input
              id="staff-pin"
              ref={pinInputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheckIn();
              }}
              placeholder="Enter staff PIN"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-mono text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
            {pinError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <ShieldX size={13} className="shrink-0" />
                {pinError}
              </p>
            )}
          </div>

          {/* Check-in button */}
          <button
            onClick={handleCheckIn}
            disabled={isChecking}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-60 hover:-translate-y-0.5 transition-all"
          >
            {isChecking ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying…
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> Verify & Check In
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Success (full-screen, unmissable) ── */}
      {screen.kind === "success" && (
        <div className="rounded-2xl bg-card border border-border/60 shadow-elegant p-10 text-center max-w-sm w-full">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
            <CheckCircle2 size={40} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
            Welcome,
            <br />
            {screen.firstName}.
          </h1>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm font-semibold text-foreground">
            <Ticket size={14} className="text-primary shrink-0" />
            {passLabel(screen.passType)}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Check-in recorded. Admit this attendee.
          </p>
        </div>
      )}

      {/* Footer branding */}
      <p className="mt-8 text-xs text-muted-foreground">Ameer Expo Africa & Middle East 2026</p>
    </div>
  );
}

// ── Reusable status card ──────────────────────────────────────────────────────
function StatusCard({
  icon: Icon,
  iconClass,
  title,
  description,
  borderClass,
}: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  description: string;
  borderClass: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-card border shadow-elegant p-10 text-center max-w-sm w-full ${borderClass}`}
    >
      <div
        className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${iconClass}`}
      >
        <Icon size={32} />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
