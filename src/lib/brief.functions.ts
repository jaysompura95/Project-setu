import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  hotspots: z
    .array(
      z.object({
        district: z.string().max(100),
        state: z.string().max(100),
        sector: z.string().max(50),
        reports90d: z.number(),
        population: z.number(),
        urgency: z.string().max(20),
        investment: z.string().max(30),
        score: z.number(),
        rank: z.number(),
        quote: z.string().max(500).optional(),
      }),
    )
    .min(1)
    .max(10),
  feedback: z.string().max(4000),
});

export const generateBrief = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ brief?: string; error?: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured for this app." };

    const evidence = data.hotspots
      .map(
        (h) =>
          `#${h.rank} ${h.district}, ${h.state} — ${h.sector}. Score ${h.score}/100. Reports (90d): ${h.reports90d}. Population affected: ${h.population}. Urgency: ${h.urgency}. Existing investment: ${h.investment}.${h.quote ? ` Sample citizen quote: "${h.quote}"` : ""}`,
      )
      .join("\n");

    const prompt = `You are a policy analyst for India's national infrastructure planning. Write a concise, evidence-based development priority brief (max ~300 words) in markdown with sections: **Summary**, **Priority projects** (numbered, one per hotspot, each citing its numbers), **Citizen evidence**, **Recommended next steps**. Only use the data given; do not invent figures.

Priority score formula: (reports × urgency weight × population) ÷ investment weight, normalised 0–100.

Selected hotspots:
${evidence}

Supporting citizen feedback from the policymaker:
${data.feedback.trim() || "(none provided)"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
      }),
    });

    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Too many requests — please wait a moment and try again." };
      if (res.status === 402) return { error: "AI credits are used up. Add credits in workspace settings to continue." };
      if (res.status === 403) return { error: "AI access is blocked for this workspace." };
      return { error: `The AI service returned an error (${res.status}).` };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          if (ev.type === "error" || ev.type === "response.failed")
            return { error: "The AI could not produce a brief. Try again." };
        } catch {
          /* ignore partial */
        }
      }
    }
    if (!text.trim()) return { error: "The AI returned an empty brief." };
    return { brief: text.trim() };
  });
