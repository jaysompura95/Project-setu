import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/setu/SiteHeader";
import { HOTSPOTS, priorityScore } from "@/lib/setu-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SETU — A national AI bridge between citizen voice and policy" },
      {
        name: "description",
        content:
          "SETU aggregates citizen development requests over voice, SMS and WhatsApp in every Indian language and ranks them into explainable national infrastructure priorities.",
      },
      { property: "og:title", content: "SETU — Citizen voice to national priorities" },
      {
        property: "og:description",
        content:
          "A Digital Public Good turning multilingual citizen reports into ranked, traceable development recommendations.",
      },
    ],
  }),
  component: Index,
});

const problems = [
  {
    n: "01",
    title: "Fragmented systems",
    body: "Complaints scatter across municipal portals, helplines and paper registers with no shared schema.",
  },
  {
    n: "02",
    title: "Misaligned spending",
    body: "Investment plans are built on demographic indices alone, disconnected from what citizens report.",
  },
  {
    n: "03",
    title: "No language coverage",
    body: "Feedback tools favour English and Hindi text, excluding rural and non-literate populations.",
  },
  {
    n: "04",
    title: "No impact loop",
    body: "Nobody can measure whether a funded project ever addressed the demand that triggered it.",
  },
];

const pipeline = [
  {
    n: "01",
    title: "Intake",
    body: "Voice, SMS, WhatsApp and web — every Indian language, every channel, offline-first.",
  },
  {
    n: "02",
    title: "Understanding",
    body: "Translate, classify by sector, and score urgency from routine to emergency.",
  },
  {
    n: "03",
    title: "Correlation",
    body: "Join with demographic, infrastructure and investment data to surface hotspots.",
  },
  {
    n: "04",
    title: "Policy layer",
    body: "Ranked, explainable recommendations traceable to real citizen quotes.",
  },
];

function Index() {
  const top = [...HOTSPOTS]
    .map((h) => ({ ...h, score: priorityScore(h) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader tone="navy" />

      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-52 right-20 h-[26rem] w-[26rem] rounded-full bg-accent/10" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <p className="eyebrow">A Digital Public Good · Multilingual</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] md:text-6xl">
            A national bridge between citizen voice and public infrastructure policy
          </h1>
          <div className="rule-accent mt-8" />
          <p className="mt-8 max-w-2xl text-lg text-navy-muted">
            Citizens speak in their own language over voice, SMS or WhatsApp. SETU
            translates, classifies and joins every report with census, infrastructure
            and investment data — then hands policymakers a ranked, traceable list.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/report"
              className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Report an issue
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-white/25 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
            >
              Open policy dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow">The problem</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          Citizen feedback dies in fragmentation
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <article
              key={p.n}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <span className="font-display text-2xl font-bold text-accent">{p.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            From a voice note to a policy line-item
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((s) => (
              <li key={s.n} className="border-t-2 border-accent pt-4">
                <span className="eyebrow">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The score</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              An explainable priority score, not a black box
            </h2>
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <p className="font-display text-lg">
                Priority = <span className="text-accent">Volume</span> ×{" "}
                <span className="text-accent">Severity</span> ×{" "}
                <span className="text-accent">Population affected</span>
              </p>
              <div className="my-3 h-px bg-border" />
              <p className="font-display text-lg">Existing infrastructure investment</p>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Every number in the formula is public: report volume from the last 90
              days, urgency inferred by the model, census-weighted reach of the
              location, and funds already allocated to that district and sector.
            </p>
          </div>
          <div className="rounded-lg bg-navy p-8 text-navy-foreground">
            <p className="eyebrow">Top priorities right now</p>
            <ul className="mt-6 space-y-4">
              {top.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-display text-lg font-semibold">
                      {h.district} — {h.sector}
                    </p>
                    <p className="text-sm text-navy-muted">
                      {h.reports90d.toLocaleString("en-IN")} reports · {h.state}
                    </p>
                  </div>
                  <span className="font-display text-3xl font-bold text-accent">
                    {h.score}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard"
              className="mt-8 inline-block rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              See the full ranked list
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
          <p className="font-display text-base text-foreground">
            सेतु — the bridge between what citizens say and where the country builds
            next.
          </p>
          <p className="mt-2">
            Prototype · Team Jay · Track: AI for Digital Public Infrastructure &
            Governance
          </p>
        </div>
      </footer>
    </div>
  );
}
