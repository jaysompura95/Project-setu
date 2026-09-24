export type Sector =
  | "Water"
  | "Roads"
  | "Sanitation"
  | "Electricity"
  | "Healthcare"
  | "Education";

export type Urgency = "Routine" | "Elevated" | "High" | "Emergency";

export type Report = {
  id: string;
  quote: string;
  original: string;
  language: string;
  channel: "Voice" | "SMS" | "WhatsApp" | "Web";
  district: string;
  sector: Sector;
  urgency: Urgency;
  daysAgo: number;
};

export type Hotspot = {
  id: string;
  district: string;
  state: string;
  sector: Sector;
  reports90d: number;
  population: number;
  investmentIndex: number; // 1 = low existing investment, 5 = high
  urgency: Urgency;
  sampleReportId: string;
};

export const URGENCY_WEIGHT: Record<Urgency, number> = {
  Routine: 1,
  Elevated: 1.6,
  High: 2.3,
  Emergency: 3,
};

export const SECTORS: Sector[] = [
  "Water",
  "Roads",
  "Sanitation",
  "Electricity",
  "Healthcare",
  "Education",
];

export const LANGUAGES = [
  "Hindi",
  "Kannada",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Odia",
  "Assamese",
  "English",
];

/** Explainable score: (volume × severity × population reach) ÷ existing investment. */
export function priorityScore(h: Hotspot): number {
  const volume = Math.log10(h.reports90d + 10) / 3.5;
  const severity = URGENCY_WEIGHT[h.urgency] / 3;
  const reach = Math.log10(h.population + 10) / 6.2;
  const raw = (volume * severity * reach) / (h.investmentIndex / 5);
  return Math.max(1, Math.min(99, Math.round(raw * 190)));
}

export const REPORTS: Report[] = [
  {
    id: "r1",
    quote: "No piped water for 3 weeks near Yelahanka. Tankers come once a week.",
    original: "ಯಲಹಂಕದಲ್ಲಿ ಮೂರು ವಾರಗಳಿಂದ ನೀರು ಬಂದಿಲ್ಲ.",
    language: "Kannada",
    channel: "Voice",
    district: "Bengaluru North",
    sector: "Water",
    urgency: "High",
    daysAgo: 2,
  },
  {
    id: "r2",
    quote: "The road to the block hospital breaks every monsoon; ambulances cannot pass.",
    original: "ब्लॉक अस्पताल तक की सड़क हर बरसात में टूट जाती है।",
    language: "Hindi",
    channel: "WhatsApp",
    district: "Purnia",
    sector: "Roads",
    urgency: "Emergency",
    daysAgo: 1,
  },
  {
    id: "r3",
    quote: "Open drains beside the school have not been cleared since March.",
    original: "शाळेजवळील उघडी गटारे मार्चपासून साफ केलेली नाहीत.",
    language: "Marathi",
    channel: "SMS",
    district: "Nagpur East",
    sector: "Sanitation",
    urgency: "Elevated",
    daysAgo: 6,
  },
  {
    id: "r4",
    quote: "Power cuts of 9 hours a day; the cold storage for our produce is failing.",
    original: "Power cuts of nine hours daily in our colony.",
    language: "English",
    channel: "Web",
    district: "Kohima",
    sector: "Electricity",
    urgency: "High",
    daysAgo: 4,
  },
  {
    id: "r5",
    quote: "Primary health centre has no night doctor; we travel 40 km after dark.",
    original: "പ്രാഥമികാരോഗ്യ കേന്ദ്രത്തിൽ രാത്രി ഡോക്ടർ ഇല്ല.",
    language: "Malayalam",
    channel: "Voice",
    district: "Alappuzha",
    sector: "Healthcare",
    urgency: "Elevated",
    daysAgo: 9,
  },
  {
    id: "r6",
    quote: "Handpump water is salty; children are falling sick every week.",
    original: "হ্যান্ডপাম্পের জল নোনতা, বাচ্চারা অসুস্থ হচ্ছে।",
    language: "Bengali",
    channel: "Voice",
    district: "Murshidabad",
    sector: "Water",
    urgency: "Emergency",
    daysAgo: 3,
  },
  {
    id: "r7",
    quote: "Two classrooms have no roof; classes stop when it rains.",
    original: "இரண்டு வகுப்பறைகளுக்கு கூரை இல்லை.",
    language: "Tamil",
    channel: "SMS",
    district: "Ramanathapuram",
    sector: "Education",
    urgency: "Elevated",
    daysAgo: 12,
  },
  {
    id: "r8",
    quote: "Street lights on the highway stretch have been dead for two months.",
    original: "రహదారిపై వీధి దీపాలు రెండు నెలలుగా పని చేయడం లేదు.",
    language: "Telugu",
    channel: "WhatsApp",
    district: "Anantapur",
    sector: "Electricity",
    urgency: "Routine",
    daysAgo: 15,
  },
];

export const HOTSPOTS: Hotspot[] = [
  {
    id: "h1",
    district: "Bengaluru North",
    state: "Karnataka",
    sector: "Water",
    reports90d: 1240,
    population: 182000,
    investmentIndex: 1,
    urgency: "High",
    sampleReportId: "r1",
  },
  {
    id: "h2",
    district: "Purnia",
    state: "Bihar",
    sector: "Roads",
    reports90d: 870,
    population: 240000,
    investmentIndex: 1,
    urgency: "Emergency",
    sampleReportId: "r2",
  },
  {
    id: "h3",
    district: "Murshidabad",
    state: "West Bengal",
    sector: "Water",
    reports90d: 610,
    population: 156000,
    investmentIndex: 2,
    urgency: "Emergency",
    sampleReportId: "r6",
  },
  {
    id: "h4",
    district: "Nagpur East",
    state: "Maharashtra",
    sector: "Sanitation",
    reports90d: 520,
    population: 98000,
    investmentIndex: 2,
    urgency: "Elevated",
    sampleReportId: "r3",
  },
  {
    id: "h5",
    district: "Kohima",
    state: "Nagaland",
    sector: "Electricity",
    reports90d: 310,
    population: 74000,
    investmentIndex: 2,
    urgency: "High",
    sampleReportId: "r4",
  },
  {
    id: "h6",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    sector: "Education",
    reports90d: 240,
    population: 61000,
    investmentIndex: 3,
    urgency: "Elevated",
    sampleReportId: "r7",
  },
  {
    id: "h7",
    district: "Alappuzha",
    state: "Kerala",
    sector: "Healthcare",
    reports90d: 180,
    population: 52000,
    investmentIndex: 4,
    urgency: "Elevated",
    sampleReportId: "r5",
  },
  {
    id: "h8",
    district: "Anantapur",
    state: "Andhra Pradesh",
    sector: "Electricity",
    reports90d: 140,
    population: 48000,
    investmentIndex: 4,
    urgency: "Routine",
    sampleReportId: "r8",
  },
];

export function investmentLabel(index: number) {
  if (index <= 1) return "Very low";
  if (index === 2) return "Low";
  if (index === 3) return "Moderate";
  return "High";
}

export function reportById(id: string) {
  return REPORTS.find((r) => r.id === id);
}
