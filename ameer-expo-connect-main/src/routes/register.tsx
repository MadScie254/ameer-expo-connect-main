import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { submitRegistration, getRegistrationStatus } from "../server/registration";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  Sparkles,
  Users,
  Hotel,
  ClipboardCheck,
  PartyPopper,
  Star,
} from "lucide-react";
import logo from "@/assets/ameer-expo-logo.png";
import { VideoEmbed } from "../components/expo/VideoEmbed";
import { LanguageSwitcher } from "../components/expo/LanguageSwitcher";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({
    meta: [
      { title: "Register · Ameer Expo Africa & Middle East 2026" },
      {
        name: "description",
        content:
          "Complete your Ameer Expo 2026 visitor registration in 6 quick steps. Get your QR badge and confirmation instantly.",
      },
      { property: "og:title", content: "Register · Ameer Expo 2026" },
      {
        property: "og:description",
        content: "Six-step visitor registration for Ameer Expo Africa & Middle East 2026.",
      },
    ],
  }),
});

const steps = [
  { key: "personal", label: "Personal", icon: User },
  { key: "professional", label: "Professional", icon: Briefcase },
  { key: "interests", label: "Interests", icon: Sparkles },
  { key: "networking", label: "Networking", icon: Users },
  { key: "logistics", label: "Logistics", icon: Hotel },
  { key: "passType", label: "Pass Type", icon: Star },
  { key: "review", label: "Review", icon: ClipboardCheck },
];

const industries = [
  "Agriculture",
  "Construction",
  "Technology",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Real Estate",
  "Finance",
  "Mining",
  "Energy",
  "Hospitality",
  "Food Processing",
  "Transport",
  "ICT",
  "Investment",
  "Tourism",
  "Other",
];

const businessTypes = [
  "Government",
  "Private",
  "NGO",
  "Investor",
  "Startup",
  "Manufacturer",
  "Distributor",
  "Importer",
  "Exporter",
  "Consultant",
  "Student",
  "Other",
];

const networkingTargets = [
  "Investors",
  "Suppliers",
  "Manufacturers",
  "Government",
  "Technology Partners",
  "Importers",
  "Exporters",
  "Distributors",
];

type FormState = {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  idNumber: string;
  country: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  linkedin: string;
  company: string;
  jobTitle: string;
  industry: string;
  website: string;
  businessType: string;
  experience: string;
  interests: string[];
  b2b: string;
  targets: string[];
  hotel: boolean;
  pickup: boolean;
  visa: boolean;
  dietary: string;
  accessibility: string;
  terms: boolean;
  passType: string;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  idNumber: "",
  country: "",
  city: "",
  phone: "",
  whatsapp: "",
  email: "",
  linkedin: "",
  company: "",
  jobTitle: "",
  industry: "",
  website: "",
  businessType: "",
  experience: "",
  interests: [],
  b2b: "",
  targets: [],
  hotel: false,
  pickup: false,
  visa: false,
  dietary: "",
  accessibility: "",
  terms: false,
  passType: "general",
};

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/60";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:-translate-y-0.5"
      }`}
    >
      {children}
    </button>
  );
}

const STORAGE_KEY = "ameer-expo-register-v1";

function calculateAge(dateValue: string) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const monthDiff = today.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

function getPersonalStepErrors(form: FormState) {
  const errors: Partial<Record<"dob" | "country" | "city", string>> = {};

  if (!form.dob.trim()) {
    errors.dob = "Date of birth is required";
  } else {
    const age = calculateAge(form.dob);
    if (age === null || age < 17) {
      errors.dob = "You must be at least 17 years old to register";
    }
  }

  if (!form.country.trim()) {
    errors.country = "Country is required";
  }

  if (!form.city.trim()) {
    errors.city = "City is required";
  }

  return errors;
}

function Register() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<FormState>(initial);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [resumedAt, setResumedAt] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmingRid, setConfirmingRid] = useState<string | null>(null);
  const [pendingRid, setPendingRid] = useState<string | null>(null);
  const [pollTimeout, setPollTimeout] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [personalTouchedFields, setPersonalTouchedFields] = useState<Record<string, boolean>>({});
  const [personalValidationAttempted, setPersonalValidationAttempted] = useState(false);

  // Check for rid in URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rid = searchParams.get("rid");
    if (rid) {
      setConfirmingRid(rid);
      setPendingRid(rid);
      // Remove rid from URL to prevent polling again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Poll for payment status
  useEffect(() => {
    if (!confirmingRid) return;

    let isSubscribed = true;
    let pollCount = 0;
    const maxPolls = 40; // 40 * 3s = 120s

    const checkStatus = async () => {
      try {
        const result = await getRegistrationStatus({ data: confirmingRid });
        if (!isSubscribed) return;

        if (result && result.paymentStatus === "paid") {
          setSubmitted(result.ticketNumber || result.referenceCode);
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                submitted: result.ticketNumber || result.referenceCode,
                savedAt: new Date().toISOString(),
              }),
            );
          } catch {
            /* ignore */
          }
          setConfirmingRid(null);
        } else if (result && result.paymentStatus === "failed") {
          setPollError("Payment failed. Please try again.");
          setConfirmingRid(null);
        } else {
          pollCount++;
          if (pollCount >= maxPolls) {
            setPollTimeout(true);
            setConfirmingRid(null);
          } else {
            setTimeout(checkStatus, 3000);
          }
        }
      } catch (err) {
        if (!isSubscribed) return;
        pollCount++;
        if (pollCount >= maxPolls) {
          setPollTimeout(true);
          setConfirmingRid(null);
        } else {
          setTimeout(checkStatus, 3000);
        }
      }
    };

    checkStatus();
    return () => {
      isSubscribed = false;
    };
  }, [confirmingRid]);

  // Load persisted draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          form?: Partial<FormState>;
          step?: number;
          savedAt?: string;
          submitted?: string | null;
        };
        if (parsed.submitted) {
          setSubmitted(parsed.submitted);
        } else {
          if (parsed.form) setF({ ...initial, ...parsed.form });
          if (typeof parsed.step === "number") {
            setStep(Math.min(Math.max(parsed.step, 0), steps.length - 1));
          }
          if (parsed.savedAt) setResumedAt(parsed.savedAt);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Autosave whenever form or step changes
  useEffect(() => {
    if (!hydrated || submitted) return;
    const t = setTimeout(() => {
      try {
        const now = new Date();
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ form: f, step, savedAt: now.toISOString() }),
        );
        setSavedAt(now);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [f, step, hydrated, submitted]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (k: "interests" | "targets", v: string) =>
    setF((s) => ({
      ...s,
      [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v],
    }));

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setF(initial);
    setStep(0);
    setResumedAt(null);
    setSavedAt(null);
  };

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const personalErrors = useMemo(() => (step === 0 ? getPersonalStepErrors(f) : {}), [f, step]);

  const showPersonalError = (field: "dob" | "country" | "city") => {
    return (
      step === 0 &&
      (personalValidationAttempted || personalTouchedFields[field]) &&
      !!personalErrors[field]
    );
  };

  const canNext = () => {
    if (step === 0) return Object.keys(personalErrors).length === 0;
    if (step === 1) return f.company && f.jobTitle && f.businessType;
    if (step === 6) return f.terms;
    return true;
  };

  const handleContinue = () => {
    if (step === 0) {
      setPersonalValidationAttempted(true);
    }
    if (canNext()) {
      setStep((s) => s + 1);
    }
  };

  const submit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (pendingRid) {
        // If we are retrying a payment that timed out/failed, resume polling
        // rather than creating a new registration
        setConfirmingRid(pendingRid);
        return;
      }

      const result = await submitRegistration({ data: f });
      if (!result.success) {
        setSubmitError(result.error || "Registration failed. Please try again.");
        return;
      }

      if (result.redirectUrl) {
        setPendingRid(result.id);
        window.location.href = result.redirectUrl;
        return;
      }
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            submitted: result.ticketNumber || result.referenceCode,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        /* ignore */
      }
      setSubmitted(result.ticketNumber || result.referenceCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      console.error("Registration error:", err);
      if (msg.trim().startsWith("<")) {
        setSubmitError(
          "Something went wrong saving your registration. Please try again in a moment.",
        );
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmingRid) {
    return (
      <div className="min-h-screen bg-secondary/40">
        <TopBar />
        <div className="mx-auto max-w-2xl px-4 py-24">
          <div className="rounded-3xl bg-card p-10 text-center shadow-elegant border border-border/60">
            <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gold/20 text-gold">
              <Star size={32} />
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold">Confirming Payment...</h2>
            <p className="mb-8 text-muted-foreground">
              Please wait while we verify your payment with Pesapal. This usually takes a few
              seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pollTimeout) {
    return (
      <div className="min-h-screen bg-secondary/40">
        <TopBar />
        <div className="mx-auto max-w-2xl px-4 py-24">
          <div className="rounded-3xl bg-card p-10 text-center shadow-elegant border border-border/60">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Check size={32} />
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold">Payment Processing</h2>
            <p className="mb-8 text-muted-foreground">
              Your payment is taking longer than usual to confirm. Don't worry — we'll email your
              confirmation and VIP pass once it goes through.
            </p>
            <button
              onClick={() => {
                setPollTimeout(false);
                submit();
              }}
              className="mt-4 rounded-xl bg-gradient-primary px-8 py-4 font-semibold text-primary-foreground shadow-glow hover:-translate-y-1 transition-all"
            >
              Try payment again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pollError) {
    return (
      <div className="min-h-screen bg-secondary/40">
        <TopBar />
        <div className="mx-auto max-w-2xl px-4 py-24">
          <div className="rounded-3xl bg-card p-10 text-center shadow-elegant border border-destructive/60">
            <h2 className="mb-4 font-display text-3xl font-bold text-destructive">
              Payment Failed
            </h2>
            <p className="mb-8 text-muted-foreground">{pollError}</p>
            <button
              onClick={() => {
                setPollError(null);
                submit();
              }}
              className="rounded-xl bg-gradient-primary px-8 py-4 font-semibold text-primary-foreground shadow-glow hover:-translate-y-1 transition-all"
            >
              Try payment again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/40">
        <TopBar />
        <div className="mx-auto max-w-2xl px-4 py-24">
          <div className="rounded-3xl bg-card p-10 text-center shadow-elegant border border-border/60">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-gold text-gold-foreground shadow-glow">
              <PartyPopper size={30} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">You're in.</h1>
            <p className="mt-2 text-muted-foreground">
              A confirmation email and QR badge are on the way.
            </p>
            <div className="mt-8 rounded-2xl bg-secondary/60 p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Ticket Number
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-primary">{submitted}</div>
            </div>
            <Link
              to="/"
              onClick={() => {
                clearDraft();
                setSubmitted(null);
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <TopBar />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        {resumedAt && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3 text-sm">
            <div className="text-foreground">
              <span className="font-semibold">Welcome back.</span>{" "}
              <span className="text-muted-foreground">
                We restored your progress from {new Date(resumedAt).toLocaleString()}.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("Discard your saved progress and start over?")) clearDraft();
              }}
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Start over
            </button>
          </div>
        )}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-6">
            {/* Stepper */}
            <div className="rounded-3xl glass shadow-soft border border-border/60 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                {steps.map((s, i) => {
                  const active = i === step;
                  const done = i < step;
                  return (
                    <div key={s.key} className="flex items-center gap-2 min-w-fit">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-all ${
                          done
                            ? "bg-gradient-primary text-primary-foreground"
                            : active
                              ? "bg-gradient-gold text-gold-foreground shadow-glow"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {done ? <Check size={16} /> : <s.icon size={16} />}
                      </div>
                      <span
                        className={`hidden sm:inline text-xs font-medium ${
                          active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                      {i < steps.length - 1 && (
                        <div className="hidden sm:block h-px w-6 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-gold transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-6 sm:p-10">
              {step === 0 && (
                <StepBlock title="Personal information" subtitle="Tell us who's attending.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="First Name" required>
                      <input
                        className={inputCls}
                        value={f.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                      />
                    </Field>
                    <Field label="Last Name" required>
                      <input
                        className={inputCls}
                        value={f.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                      />
                    </Field>
                    <Field label="Gender">
                      <select
                        className={inputCls}
                        value={f.gender}
                        onChange={(e) => set("gender", e.target.value)}
                      >
                        <option value="">Select…</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Prefer not to say</option>
                      </select>
                    </Field>
                    <Field
                      label="Date of Birth"
                      required
                      error={showPersonalError("dob") ? personalErrors.dob : undefined}
                    >
                      <input
                        type="date"
                        className={inputCls}
                        value={f.dob}
                        max={(() => {
                          const maxDate = new Date();
                          maxDate.setFullYear(maxDate.getFullYear() - 17);
                          const year = maxDate.getFullYear();
                          const month = String(maxDate.getMonth() + 1).padStart(2, "0");
                          const day = String(maxDate.getDate()).padStart(2, "0");
                          return `${year}-${month}-${day}`;
                        })()}
                        onChange={(e) => set("dob", e.target.value)}
                        onBlur={() => setPersonalTouchedFields((s) => ({ ...s, dob: true }))}
                      />
                    </Field>
                    <Field label="Passport / National ID">
                      <input
                        className={inputCls}
                        value={f.idNumber}
                        onChange={(e) => set("idNumber", e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Country"
                      required
                      error={showPersonalError("country") ? personalErrors.country : undefined}
                    >
                      <input
                        className={inputCls}
                        value={f.country}
                        onChange={(e) => set("country", e.target.value)}
                        onBlur={() => setPersonalTouchedFields((s) => ({ ...s, country: true }))}
                      />
                    </Field>
                    <Field
                      label="City"
                      required
                      error={showPersonalError("city") ? personalErrors.city : undefined}
                    >
                      <input
                        className={inputCls}
                        value={f.city}
                        onChange={(e) => set("city", e.target.value)}
                        onBlur={() => setPersonalTouchedFields((s) => ({ ...s, city: true }))}
                      />
                    </Field>
                    <Field label="Phone Number" required>
                      <input
                        className={inputCls}
                        value={f.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+254…"
                      />
                    </Field>
                    <Field label="WhatsApp Number">
                      <input
                        className={inputCls}
                        value={f.whatsapp}
                        onChange={(e) => set("whatsapp", e.target.value)}
                      />
                    </Field>
                    <Field label="Email Address" required>
                      <input
                        type="email"
                        className={inputCls}
                        value={f.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </Field>
                    <Field label="LinkedIn (optional)">
                      <input
                        className={inputCls}
                        value={f.linkedin}
                        onChange={(e) => set("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/…"
                      />
                    </Field>
                    <Field label="Photo Upload">
                      <input
                        type="file"
                        accept="image/*"
                        className={
                          inputCls +
                          " file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                        }
                      />
                    </Field>
                  </div>
                </StepBlock>
              )}

              {step === 1 && (
                <StepBlock title="Professional information" subtitle="Where do you work?">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Company Name" required>
                      <input
                        className={inputCls}
                        value={f.company}
                        onChange={(e) => set("company", e.target.value)}
                      />
                    </Field>
                    <Field label="Job Title" required>
                      <input
                        className={inputCls}
                        value={f.jobTitle}
                        onChange={(e) => set("jobTitle", e.target.value)}
                      />
                    </Field>
                    <Field label="Industry">
                      <select
                        className={inputCls}
                        value={f.industry}
                        onChange={(e) => set("industry", e.target.value)}
                      >
                        <option value="">Select industry…</option>
                        {industries.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Company Website">
                      <input
                        className={inputCls}
                        value={f.website}
                        onChange={(e) => set("website", e.target.value)}
                        placeholder="https://…"
                      />
                    </Field>
                    <Field label="Business Type" required>
                      <select
                        className={inputCls}
                        value={f.businessType}
                        onChange={(e) => set("businessType", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {businessTypes.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Years of Experience">
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={f.experience}
                        onChange={(e) => set("experience", e.target.value)}
                      />
                    </Field>
                  </div>
                </StepBlock>
              )}

              {step === 2 && (
                <StepBlock
                  title="Areas of interest"
                  subtitle="Pick everything you'd like to explore."
                >
                  <div className="flex flex-wrap gap-2">
                    {industries.map((i) => (
                      <Chip
                        key={i}
                        active={f.interests.includes(i)}
                        onClick={() => toggle("interests", i)}
                      >
                        {i}
                      </Chip>
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === 3 && (
                <StepBlock
                  title="Networking preferences"
                  subtitle="We'll match you with the right people."
                >
                  <div className="space-y-6">
                    <Field label="Would you like to schedule B2B meetings?">
                      <div className="flex gap-2">
                        {["Yes", "No"].map((v) => (
                          <Chip key={v} active={f.b2b === v} onClick={() => set("b2b", v)}>
                            {v}
                          </Chip>
                        ))}
                      </div>
                    </Field>
                    <Field label="Interested in meeting">
                      <div className="flex flex-wrap gap-2">
                        {networkingTargets.map((v) => (
                          <Chip
                            key={v}
                            active={f.targets.includes(v)}
                            onClick={() => toggle("targets", v)}
                          >
                            {v}
                          </Chip>
                        ))}
                      </div>
                    </Field>
                  </div>
                </StepBlock>
              )}

              {step === 4 && (
                <StepBlock title="Logistics & accommodation" subtitle="We'll handle the details.">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { k: "hotel", label: "Need hotel booking?" },
                      { k: "pickup", label: "Airport pickup?" },
                      { k: "visa", label: "Visa invitation letter?" },
                    ].map((o) => (
                      <label
                        key={o.k}
                        className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                          f[o.k as "hotel"]
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={f[o.k as "hotel"]}
                          onChange={(e) => set(o.k as "hotel", e.target.checked)}
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{o.label}</span>
                          <span
                            className={`h-5 w-5 grid place-items-center rounded-full border ${f[o.k as "hotel"] ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                          >
                            {f[o.k as "hotel"] && <Check size={12} />}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field label="Special dietary requirements">
                      <input
                        className={inputCls}
                        value={f.dietary}
                        onChange={(e) => set("dietary", e.target.value)}
                      />
                    </Field>
                    <Field label="Accessibility needs">
                      <input
                        className={inputCls}
                        value={f.accessibility}
                        onChange={(e) => set("accessibility", e.target.value)}
                      />
                    </Field>
                  </div>
                </StepBlock>
              )}

              {step === 5 && (
                <StepBlock title="Select your pass" subtitle="Choose your experience for the expo.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        id: "general",
                        title: "General (Free)",
                        desc: "Access to the main exhibition floor and open sessions.",
                        price: 0,
                      },
                      {
                        id: "vip",
                        title: "VIP Pass",
                        desc: "VIP lounge access, fast-track badge, gala dinner, and concierge.",
                        price: 5000,
                      },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => set("passType", p.id)}
                        className={`cursor-pointer rounded-2xl border p-5 text-left transition-all ${
                          f.passType === p.id
                            ? "border-primary bg-primary/5 shadow-soft ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-semibold">{p.title}</span>
                          <span
                            className={`h-5 w-5 grid place-items-center rounded-full border ${f.passType === p.id ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                          >
                            {f.passType === p.id && <Check size={12} />}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                        <div className="mt-4 font-bold text-foreground">
                          {p.price === 0 ? "Free" : `KES ${p.price.toLocaleString()}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === 6 && (
                <StepBlock title="Review & confirm" subtitle="Everything look right?">
                  <div className="rounded-2xl bg-secondary/50 p-5 sm:p-6 grid gap-4 sm:grid-cols-2 text-sm">
                    <Sum label="Name" value={`${f.firstName} ${f.lastName}`} />
                    <Sum label="Email" value={f.email} />
                    <Sum label="Phone" value={f.phone} />
                    <Sum
                      label="Country / City"
                      value={[f.country, f.city].filter(Boolean).join(", ")}
                    />
                    <Sum label="Company" value={f.company} />
                    <Sum label="Role" value={f.jobTitle} />
                    <Sum label="Business Type" value={f.businessType} />
                    <Sum label="Industry" value={f.industry} />
                    <Sum label="Interests" value={f.interests.join(", ") || "—"} />
                    <Sum label="B2B Meetings" value={f.b2b || "—"} />
                    <Sum label="Meeting" value={f.targets.join(", ") || "—"} />
                    <Sum
                      label="Logistics"
                      value={
                        [f.hotel && "Hotel", f.pickup && "Pickup", f.visa && "Visa"]
                          .filter(Boolean)
                          .join(", ") || "—"
                      }
                    />
                    <Sum
                      label="Pass Type"
                      value={f.passType === "vip" ? "VIP Pass (KES 5,000)" : "General (Free)"}
                    />
                  </div>
                  <label className="mt-6 flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={f.terms}
                      onChange={(e) => set("terms", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-input"
                    />
                    <span>
                      I accept the{" "}
                      <Link to="/terms" target="_blank" className="text-primary underline">
                        terms & conditions
                      </Link>{" "}
                      and consent to receive event communications.
                    </span>
                  </label>

                  {import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                    <div className="mt-6">
                      <div
                        className="cf-turnstile"
                        data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        data-callback="onTurnstileSuccess"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
                      Your data is encrypted in transit.
                    </div>
                  )}
                </StepBlock>
              )}

              {/* Nav */}
              <div className="mt-10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => canNext() && setStep((s) => s + 1)}
                    disabled={!canNext()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 shadow-soft hover:-translate-y-0.5 transition-all"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    {submitError && (
                      <span className="text-sm font-medium text-destructive">{submitError}</span>
                    )}
                    <button
                      onClick={submit}
                      disabled={!f.terms || isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-glow disabled:opacity-50 hover:-translate-y-0.5 transition-all"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : f.passType === "vip"
                          ? "Proceed to Payment"
                          : "Complete Registration"}{" "}
                      <Check size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center text-xs text-muted-foreground">
                {savedAt
                  ? `Progress saved automatically · ${savedAt.toLocaleTimeString()}`
                  : "Your progress saves automatically to this device."}
              </div>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <div className="sticky top-24 rounded-3xl bg-card border border-border/60 shadow-soft p-6">
              <h3 className="font-display font-semibold mb-4 text-lg text-foreground">
                Experience Ameer Expo
              </h3>
              <VideoEmbed
                youtubeId="1wxUUTY-c48"
                caption="Join industry leaders in shaping the future."
              />
              <div className="mt-6 rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                <p>
                  Hear from previous attendees about their experience, the networking opportunities,
                  and the insights they gained.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Sum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium text-foreground break-words">{value || "—"}</div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Ameer Expo"
            className="h-9 w-9 object-contain"
            width={36}
            height={36}
          />
          <div className="leading-tight">
            <div className="font-display font-bold text-sm">Ameer Expo</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Visitor Registration
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            Save & exit
          </Link>
        </div>
      </div>
    </div>
  );
}
