type AiResult = { text: string; provider: string; confidence: number };

function env(name: string, fallback = "") {
  return (process.env[name] || fallback).trim().replace(/^['\"]|['\"]$/g, "");
}

async function gemini(prompt: string): Promise<AiResult> {
  const apiKey = env("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const model = env("GEMINI_MODEL", "gemini-2.0-flash");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 2200 } })
  });
  const raw = await res.text();
  if (!res.ok) {
    console.error("[GEMINI_ERROR]", res.status, raw);
    throw new Error("Gemini request failed");
  }
  const data = JSON.parse(raw);
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n").trim() || "No response returned.";
  return { text, provider: "gemini", confidence: 0.82 };
}

function mock(prompt: string): AiResult {
  const p = prompt.toLowerCase();
  let text = `## ShopIQ Business Brief\n\nI reviewed the current shop context and prepared a practical operating summary.\n\n### Recommended Focus\n- Prioritize low-stock fast-moving products.\n- Collect pending customer balances before month close.\n- Review supplier payables and reorder only high-margin items.\n\n### Next Actions\n1. Check the low stock list.\n2. Reorder products with strong sales velocity.\n3. Follow up with customers with overdue balances.`;
  if (p.includes("reorder")) text = `## Reorder Plan\n\n### High Priority\n- Reorder fast-moving low-stock products first.\n- Keep 10–14 days of cover for electronics and accessories.\n\n### Review Before Buying\n- Avoid overstocking slow movers.\n- Compare supplier balances before placing purchase orders.`;
  return { text, provider: "mock", confidence: 0.7 };
}

export async function runAiTask(prompt: string): Promise<AiResult> {
  const provider = env("AI_PROVIDER", "mock");
  try {
    if (provider === "gemini") return await gemini(prompt);
    return mock(prompt);
  } catch (error) {
    if (env("AI_ALLOW_MOCK_FALLBACK", "true") === "true") return mock(prompt);
    throw error;
  }
}
