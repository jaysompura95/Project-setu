import { Link } from "@tanstack/react-router";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "navy" }) {
  const navy = tone === "navy";
  return (
    <header
      className={
        navy
          ? "border-b border-white/10 bg-navy text-navy-foreground"
          : "border-b border-border bg-card"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold">सेतु</span>
          <span className="eyebrow">SETU</span>
        </Link>
        <nav className="flex items-center gap-0 text-xs sm:gap-1 sm:text-sm">
          <Link
            to="/report"
            className={`rounded-md px-2 py-2 sm:px-3 transition-colors ${navy ? "hover:bg-white/10" : "hover:bg-secondary"}`}
            activeProps={{ className: "rounded-md px-2 py-2 sm:px-3 font-semibold text-accent" }}
          >
            Report an issue
          </Link>
          <Link
            to="/dashboard"
            className={`rounded-md px-2 py-2 sm:px-3 transition-colors ${navy ? "hover:bg-white/10" : "hover:bg-secondary"}`}
            activeProps={{ className: "rounded-md px-2 py-2 sm:px-3 font-semibold text-accent" }}
          >
            Policy dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const bg =
    score >= 80
      ? "bg-signal-high"
      : score >= 60
        ? "bg-signal-mid"
        : "bg-signal-low";
  return (
    <span
      className={`inline-flex h-9 w-12 items-center justify-center rounded-md font-display text-base font-bold text-navy-foreground ${bg}`}
    >
      {score}
    </span>
  );
}
