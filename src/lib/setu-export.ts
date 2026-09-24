import { URGENCY_WEIGHT, investmentLabel, type Hotspot } from "./setu-data";

export type RankedHotspot = Hotspot & { score: number; liveAdds: number };

export function rankReasons(h: RankedHotspot, all: RankedHotspot[]): string {
  const r: string[] = [];
  const maxReports = Math.max(...all.map((x) => x.reports90d));
  const maxPop = Math.max(...all.map((x) => x.population));
  if (URGENCY_WEIGHT[h.urgency] >= 3) r.push(`${h.urgency.toLowerCase()} urgency (weight ${URGENCY_WEIGHT[h.urgency]})`);
  if (h.reports90d >= maxReports * 0.6) r.push("very high report volume");
  if (h.population >= maxPop * 0.6) r.push("large affected population");
  if (h.investmentIndex <= 1) r.push("very low existing investment");
  else if (h.investmentIndex >= 4) r.push("high existing investment lowers priority");
  if (h.liveAdds > 0) r.push(`${h.liveAdds} new citizen reports`);
  if (!r.length) r.push("moderate volume, urgency and population relative to peers");
  return r.join("; ");
}

function rows(list: RankedHotspot[]) {
  return list.map((h, i) => ({
    rank: i + 1,
    district: h.district,
    state: h.state,
    sector: h.sector,
    score: h.score,
    reports: h.reports90d,
    urgency: h.urgency,
    urgencyWeight: URGENCY_WEIGHT[h.urgency],
    population: h.population,
    investment: `${investmentLabel(h.investmentIndex)} (${h.investmentIndex})`,
    reasons: rankReasons(h, list),
  }));
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(list: RankedHotspot[]) {
  const header = ["Rank", "District", "State", "Sector", "Priority score", "Reports (90d)", "Urgency", "Urgency weight", "Population affected", "Investment weight", "Ranking reasons"];
  const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows(list).map((r) =>
    [r.rank, r.district, r.state, r.sector, r.score, r.reports, r.urgency, r.urgencyWeight, r.population, r.investment, r.reasons].map(esc).join(","),
  );
  download(new Blob([[header.map(esc).join(","), ...body].join("\n")], { type: "text/csv" }), "setu-hotspots.csv");
}

export async function exportPdf(list: RankedHotspot[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("SETU — Ranked infrastructure hotspots", 14, 16);
  doc.setFontSize(9);
  doc.text("Priority score = (reports x urgency weight x population) / investment weight, normalised 0-100.", 14, 23);
  autoTable(doc, {
    startY: 28,
    head: [["#", "District", "State", "Sector", "Score", "Reports", "Urgency (wt)", "Population", "Investment (wt)", "Why this rank"]],
    body: rows(list).map((r) => [r.rank, r.district, r.state, r.sector, r.score, r.reports.toLocaleString("en-IN"), `${r.urgency} (${r.urgencyWeight})`, r.population.toLocaleString("en-IN"), r.investment, r.reasons]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [20, 33, 61] },
    columnStyles: { 9: { cellWidth: 70 } },
  });
  doc.save("setu-hotspots.pdf");
}
