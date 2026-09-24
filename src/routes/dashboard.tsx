import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, ScoreBadge } from "@/components/setu/SiteHeader";
import {
  HOTSPOTS,
  SECTORS,
  investmentLabel,
  priorityScore,
  reportById,
  type Sector,
} from "@/lib/setu-data";
import { useSubmissions } from "@/lib/setu-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Policy dashboard — SETU" },
      {
        name: "description",
        content:
          "A ranked, traceable list of district-level infrastructure priorities built from citizen reports joined with census, infrastructure and investment data.",
      },
      { property: "og:title", content: "Policy dashboard — SETU" },
      {
        property: "og:description",
        content:
          "Explainable priority scores for national planners, each traceable to real citizen quotes.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const submissions = useSubmissions();
  const [sector, setSector] = useState<Sector | "All">("All");
  const [selectedId, setSelectedId] = useState("h1");

  const ranked = useMemo(() => {
    return HOTSPOTS.map((h) => {
      const extra = submissions.filter(
        (s) =>
          s.sector === h.sector &&
          s.district.toLowerCase() === h.district.toLowerCase(),
      ).length;
      const withLive = { ...h, reports90d: h.reports90d + extra };
      return { ...withLive, score: priorityScore(withLive), liveAdds: extra };
    })
      .filter((h) => sector === "All" || h.sector === sector)
      .sort((a, b) => b.score - a.score);
  }, [sector, submissions]);

  const selected = ranked.find((h) => h.id === selectedId) ?? ranked[0];
  const quote = selected ? reportById(selected.sampleReportId) : undefined;

  const totalReports = ranked.reduce((n, h) => n + h.reports90d, 0);
  const people = ranked.reduce((n, h) => n + h.population, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="eyebrow">National priority list</p>
        <h1 className="mt-3 text-4xl font-bold">
          Ranked, mapped and traceable to a citizen
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Reports (90 days)", value: totalReports.toLocaleString("en-IN") },
            { label: "Population covered", value: people.toLocaleString("en-IN") },
            { label: "Districts flagged", value: String(ranked.length) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["All", ...SECTORS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSector(s as Sector | "All")}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                sector === s
                  ? "border-accent bg-accent/15"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          <ul className="space-y-3">
            {ranked.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => setSelectedId(h.id)}
                  className={`flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left transition-colors ${
                    selected?.id === h.id
                      ? "border-accent shadow-sm"
                      : "border-border hover:bg-secondary/60"
                  }`}
                >
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {h.district} — {h.sector}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {h.state} · {h.reports90d.toLocaleString("en-IN")} reports ·{" "}
                      {h.urgency} urgency
                      {h.liveAdds > 0 && (
                        <span className="ml-2 rounded bg-accent/20 px-2 py-0.5 text-xs font-semibold text-foreground">
                          +{h.liveAdds} new
                        </span>
                      )}
                    </p>
                  </div>
                  <ScoreBadge score={h.score} />
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <aside className="h-fit rounded-lg bg-navy p-6 text-navy-foreground">
              <p className="eyebrow">Why this rank</p>
              <h2 className="mt-3 text-2xl font-bold">
                {selected.district} — {selected.sector}
              </h2>
              {quote && (
                <blockquote className="mt-5 border-l-2 border-accent pl-4 text-sm italic text-navy-foreground/90">
                  “{quote.quote}”
                  <footer className="mt-2 not-italic text-xs text-navy-muted">
                    — {quote.channel.toLowerCase()} report, {quote.language},
                    translated
                  </footer>
                </blockquote>
              )}
              <dl className="mt-6 space-y-3 text-sm">
                {[
                  ["Reports (90d)", selected.reports90d.toLocaleString("en-IN")],
                  ["Population affected", selected.population.toLocaleString("en-IN")],
                  ["Existing investment", investmentLabel(selected.investmentIndex)],
                  ["Urgency", selected.urgency],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-white/10 pb-2"
                  >
                    <dt className="text-navy-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-md bg-white/5 p-4 text-xs leading-relaxed text-navy-muted">
                Score = volume × severity × population affected, divided by existing
                infrastructure investment. Every input is public data or a citizen
                report you can open.
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
