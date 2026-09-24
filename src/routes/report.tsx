import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/setu/SiteHeader";
import { LANGUAGES } from "@/lib/setu-data";
import { addSubmission, classify, useSubmissions } from "@/lib/setu-store";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an issue — SETU" },
      {
        name: "description",
        content:
          "Send a development request to SETU by voice, SMS, WhatsApp or web in any Indian language; it is translated, classified and scored automatically.",
      },
      { property: "og:title", content: "Report an issue — SETU" },
      {
        property: "og:description",
        content:
          "Multilingual citizen intake over voice, SMS, WhatsApp and web for national infrastructure planning.",
      },
    ],
  }),
  component: ReportPage;
});

const CHANNELS = ["Voice", "SMS", "WhatsApp", "Web"] as const;

function ReportPage() {
  const submissions = useSubmissions();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [district, setDistrict] = useState("");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("Voice");
  const [recording, setRecording] = useState(false);

  const preview = text.trim() ? classify(text) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !district.trim()) return;
    const { sector, urgency } = classify(trimmed);
    addSubmission({
      id: crypto.randomUUID(),
      text: trimmed,
      language,
      channel,
      district: district.trim(),
      sector,
      urgency,
      translated: trimmed,
      at: Date.now(),
    });
    setText("");
  }

  function simulateVoice() {
    setRecording(true);
    setChannel("Voice");
    setTimeout(() => {
      setRecording(false);
      setText("No water in our colony for two weeks, children are falling sick.");
    }, 1400);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="eyebrow">Citizen intake</p>
        <h1 className="mt-3 text-4xl font-bold">Tell us what your area needs</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Speak or write in your own language. SETU translates it, identifies the
          sector and urgency, and adds it to the national demand map.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <form
            onSubmit={submit}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannel(c)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    channel === c
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="mt-6 block text-sm font-semibold" htmlFor="issue">
              Your message
            </label>
            <textarea
              id="issue"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="e.g. हमारी कॉलोनी में दो हफ्ते से पानी नहीं आया"
              className="mt-2 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              type="button"
              onClick={simulateVoice}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${recording ? "animate-pulse bg-destructive" : "bg-accent"}`}
              />
              {recording ? "Listening…" : "Record a voice note (demo)"}
            </button>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold" htmlFor="lang">
                  Language
                </label>
                <select
                  id="lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold" htmlFor="district">
                  District / locality
                </label>
                <input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Purnia"
                  className="mt-2 w-full rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {preview && (
              <div className="mt-6 rounded-md bg-secondary p-4 text-sm">
                <p className="eyebrow">Live AI reading</p>
                <p className="mt-2">
                  Sector: <strong>{preview.sector}</strong> · Urgency:{" "}
                  <strong>{preview.urgency}</strong> · Language:{" "}
                  <strong>{language}</strong>
                </p>
              </div>
            )}

            <button
              type="submit"
              className="mt-6 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Submit report
            </button>
          </form>

          <aside className="rounded-lg bg-navy p-6 text-navy-foreground">
            <p className="eyebrow">Your submissions this session</p>
            {submissions.length === 0 ? (
              <p className="mt-4 text-sm text-navy-muted">
                Nothing yet. Submitted reports appear here and flow into the policy
                dashboard.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {submissions.map((s) => (
                  <li key={s.id} className="border-b border-white/10 pb-4 last:border-0">
                    <p className="text-sm">{s.text}</p>
                    <p className="mt-2 text-xs text-navy-muted">
                      {s.district} · {s.sector} · {s.urgency} · {s.language} via{" "}
                      {s.channel}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              See how planners read this
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
