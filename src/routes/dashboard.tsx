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
import { exportCsv, exportPdf, rankReasons } from "@/lib/setu-export";
import { generateBrief } from "@/lib/brief.functions";
import { useServerFn } from "@tanstack/react-start";
import { URGENCY_WEIGHT, type Urgency } from "@/lib/setu-data";

const URGENCIES: Urgency[] = ["Emergency", "High", "Elevated", "Routine"];
const STATES = [...new Set(HOTSPOTS.map((h) => h.state))].sort();
const selectCls = "rounded-md border border-border bg-card px-3 py-2 text-sm";

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
  const [state, setState] = useState("All");
  const [urgency, setUrgency] = useState<Urgency | "All">("All");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [brief, setBrief] = useState("");
  const [briefErr, setBriefErr] = useState("");
  const [loading, setLoading] = useState(false);
  const runBrief = useServerFn(generateBrief);

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
      .filter(
        (h) =>
          (sector === "All" || h.sector === sector) &&
          (state === "All" || h.state === state) &&
          (urgency === "All" || h.urgency === urgency) &&
          h.score >= minScore &&
          h.score <= maxScore,
      )
      .sort((a, b) => b.score - a.score);
  }, [sector, state, urgency, minScore, maxScore, submissions]);

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-10)));

  async function onBrief() {
    const chosen = ranked.filter((h) => picked.includes(h.id));
    if (!chosen.length) return;
    setLoading(true);
    setBrief("");
    setBriefErr("");
    try {
      const res = await runBrief({
        data: {
          feedback,
          hotspots: chosen.map((h) => ({
            district: h.district,
            state: h.state,
            sector: h.sector,
            reports90d: h.reports90d,
            population: h.population,
            urgency: h.urgency,
            investment: investmentLabel(h.investmentIndex),
            score: h.score,
            rank: ranked.indexOf(h) + 1,
            quote: reportById(h.sampleReportId)?.quote,
          })),
        },
      });
      if (res.error) setBriefErr(res.error);
      else setBrief(res.brief ?? "");
    } catch {
      setBriefErr("Could not reach the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted-foreground">
            State
            <select className={`${selectCls} mt-1 block`} value={state} onChange={(e) => setState(e.target.value)}>
              <option>All</option>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Urgency
            <select className={`${selectCls} mt-1 block`} value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency | "All")}>
              <option>All</option>
              {URGENCIES.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Min score
            <input type="number" min={0} max={100} className={`${selectCls} mt-1 block w-24`} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
          </label>
          <label className="text-xs text-muted-foreground">
            Max score
            <input type="number" min={0} max={100} className={`${selectCls} mt-1 block w-24`} value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} />
          </label>
          <button className="text-sm text-muted-foreground underline" onClick={() => { setSector("All"); setState("All"); setUrgency("All"); setMinScore(0); setMaxScore(100); }}>
            Reset filters
          </button>
          <div className="ml-auto flex gap-2">
            <button disabled={!ranked.length} onClick={() => exportCsv(ranked)} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50">Export CSV</button>
            <button disabled={!ranked.length} onClick={() => exportPdf(ranked)} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50">Export PDF</button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          <ul className="space-y-3">
            {ranked.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">No hotspots match these filters.</li>
            )}
            {ranked.map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <input type="checkbox" aria-label={`Include ${h.district} in brief`} checked={picked.includes(h.id)} onChange={() => togglePick(h.id)} className="h-4 w-4 accent-[var(--accent)]" />
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
                Score {selected.score} = ({selected.reports90d.toLocaleString("en-IN")} reports × urgency {URGENCY_WEIGHT[selected.urgency]} × {selected.population.toLocaleString("en-IN")} people) ÷ investment {selected.investmentIndex}, normalised 0–100.
                <p className="mt-2 text-navy-foreground/90">Why: {rankReasons(selected, ranked)}.</p>
              </div>
            </aside>
          )}
        </div>

        <section className="mt-12 rounded-lg border border-border bg-card p-6">
          <p className="eyebrow">AI priority brief</p>
          <h2 className="mt-2 text-2xl font-bold">Draft an evidence-based brief</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tick hotspots in the list ({picked.length} selected), add any supporting citizen feedback, and generate a concise brief.
          </p>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={4000} rows={4} placeholder="e.g. Ward councillors in Purnia report 3 ambulance delays last month…" className="mt-4 w-full rounded-md border border-border bg-background p-3 text-sm" />
          <button onClick={onBrief} disabled={loading || picked.length === 0} className="mt-3 rounded-md bg-navy px-5 py-2 text-sm font-semibold text-navy-foreground disabled:opacity-50">
            {loading ? "Writing brief…" : "Generate brief"}
          </button>
          {briefErr && <p className="mt-4 text-sm text-destructive">{briefErr}</p>}
          {brief && (
            <div className="mt-6 whitespace-pre-wrap rounded-md border border-border bg-background p-5 text-sm leading-relaxed">{brief}</div>
          )}
        </section>
      </main>
    </div>
  );
}
