import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { submitExhibitorLead } from "../server/exhibitor-lead";

// Lead-capture flow by design: no payment is collected here; booth/sponsorship deals are negotiated manually after the team follows up.

export const Route = createFileRoute("/exhibit")({
  component: ExhibitPage,
  head: () => ({
    meta: [
      { title: "Exhibit & Sponsor · Ameer Expo Africa & Middle East 2026" },
      {
        name: "description",
        content: "Express your interest in exhibiting or sponsoring Ameer Expo 2026.",
      },
    ],
  }),
});

function ExhibitPage() {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState<"booth" | "sponsorship">("booth");
  const [tierOrSize, setTierOrSize] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const boothSizes = ["6 sqm", "9 sqm", "18 sqm", "36 sqm", "Custom"];
  const sponsorshipTiers = ["Diamond", "Platinum", "Gold", "Silver", "Bronze"];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await submitExhibitorLead({
        data: {
          company,
          contactName,
          email,
          phone,
          interest,
          tierOrSize,
          message,
        },
      });
      if (!result.success) {
        setError(result.error || "Unable to submit your request right now.");
        return;
      }
      setSuccess(true);
      setCompany("");
      setContactName("");
      setEmail("");
      setPhone("");
      setInterest("booth");
      setTierOrSize("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl border border-border/60 bg-card p-8 shadow-soft sm:p-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Exhibit & Sponsor
          </p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Tell us about your interest
          </h1>
          <p className="text-base text-muted-foreground">
            Share your preferred booth or sponsorship package and our team will follow up directly.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-700 dark:text-emerald-400">
            We&apos;ll be in touch within 2 business days.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              <span className="mb-2 block">Company</span>
              <input
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              <span className="mb-2 block">Contact name</span>
              <input
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              <span className="mb-2 block">Email</span>
              <input
                required
                type="email"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              <span className="mb-2 block">Phone</span>
              <input
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              <span className="mb-2 block">Interest</span>
              <select
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={interest}
                onChange={(event) => {
                  setInterest(event.target.value as "booth" | "sponsorship");
                  setTierOrSize("");
                }}
              >
                <option value="booth">Booth</option>
                <option value="sponsorship">Sponsorship</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              <span className="mb-2 block">
                {interest === "booth" ? "Booth size" : "Sponsorship tier"}
              </span>
              <select
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={tierOrSize}
                onChange={(event) => setTierOrSize(event.target.value)}
              >
                <option value="">Select…</option>
                {(interest === "booth" ? boothSizes : sponsorshipTiers).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-foreground">
            <span className="mb-2 block">Message</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us about your goals, preferred package, or timing."
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit interest"}
          </button>
        </form>
      </div>
    </main>
  );
}
