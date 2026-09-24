import { useSyncExternalStore } from "react";
import type { Sector, Urgency } from "./setu-data";

export type Submission = {
  id: string;
  text: string;
  language: string;
  channel: "Voice" | "SMS" | "WhatsApp" | "Web";
  district: string;
  sector: Sector;
  urgency: Urgency;
  translated: string;
  at: number;
};

let submissions: Submission[] = [];
const listeners = new Set<() => void>();

function emit() {
  submissions = [...submissions];
  listeners.forEach((l) => l());
}

export function addSubmission(s: Submission) {
  submissions = [s, ...submissions];
  emit();
}

export function useSubmissions() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => submissions,
    () => submissions,
  );
}

/** Very small keyword classifier standing in for the NLU service. */
export function classify(text: string): { sector: Sector; urgency: Urgency } {
  const t = text.toLowerCase();
  const table: [Sector, string[]][] = [
    ["Water", ["water", "tanker", "pipe", "borewell", "पानी", "நீர்"]],
    ["Roads", ["road", "pothole", "bridge", "सड़क", "रस्ता"]],
    ["Sanitation", ["drain", "garbage", "toilet", "sewage", "कचरा"]],
    ["Electricity", ["power", "electric", "light", "transformer", "बिजली"]],
    ["Healthcare", ["hospital", "doctor", "clinic", "medicine", "अस्पताल"]],
    ["Education", ["school", "teacher", "classroom", "स्कूल"]],
  ];
  let sector: Sector = "Water";
  for (const [s, words] of table) {
    if (words.some((w) => t.includes(w))) {
      sector = s;
      break;
    }
  }
  const emergency = ["emergency", "died", "ambulance", "collapse", "no water", "flood"];
  const high = ["weeks", "months", "children", "sick", "broken", "danger"];
  const urgency: Urgency = emergency.some((w) => t.includes(w))
    ? "Emergency"
    : high.some((w) => t.includes(w))
      ? "High"
      : "Elevated";
  return { sector, urgency };
}
