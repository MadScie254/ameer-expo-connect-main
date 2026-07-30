import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/expo/Navbar";
import { Footer } from "@/components/expo/Footer";
import termsContent from "../server/terms.md?raw";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Ameer Expo 2026" },
      {
        name: "description",
        content:
          "Terms and conditions for attending, exhibiting, and sponsoring Ameer Expo Africa & Middle East 2026.",
      },
    ],
  }),
});

function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-primary-foreground/5 p-6 md:p-12 shadow-soft">
            <div className="prose prose-sm md:prose-base dark:prose-invert prose-gold max-w-none prose-headings:font-display prose-a:text-gold hover:prose-a:text-gold-soft">
              <ReactMarkdown>{termsContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
