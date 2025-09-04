import { POLICY_INDEX } from "./lib/policyIndex";

export async function analyzeImpact({ country, party, profile }) {
  const kbParty = POLICY_INDEX[country]?.[party];
  if (!kbParty) return { topics: [], summary: `No policy data for ${party} in ${country}.` };

  const user = normalizeProfile(profile);
  const topics = Object.entries(kbParty).map(([key, policy]) => {
    const { verdict, rationale } = scoreImpact(key, policy, user);
    return { topic: key, verdict, rationale, details: policy.details, source: policy.source };
  });

  const counts = topics.reduce((a, t) => ((a[t.verdict] = (a[t.verdict] || 0) + 1), a), {});
  return { topics, summary: summarizeCounts(counts) };
}

function normalizeProfile(p) {
  return {
    incomeBand: parseIncomeBand(String(p.income || "")),
    age: Number(p.age || 0),
    isStudent: /student/i.test(p.employment || ""),
    isRetired: /retired/i.test(p.employment || ""),
    commute: String(p.commute || "").toLowerCase(),
    locale: String(p.cityRural || "").toLowerCase(),
    concerns: Array.isArray(p.concerns) ? p.concerns : []
  };
}
function parseIncomeBand(label) {
  const clean = label.replace(/[,€]/g, "");
  const m = clean.match(/(\d+)\s*–\s*(\d+)/) || clean.match(/Less than\s*(\d+)/i) || clean.match(/(\d+)\s*or more/i);
  if (!m) return { min: null, max: null, label };
  if (/Less than/i.test(clean)) return { min: 0, max: Number(m[1]), label };
  if (/or more/i.test(clean)) return { min: Number(m[1]), max: null, label };
  return { min: Number(m[1]), max: Number(m[2]), label };
}
function scoreImpact(topicKey, policy, user) {
  let verdict = "unclear", rationale = "Insufficient information.";
  switch (topicKey) {
    case "wages_minimum":
      verdict = (user.incomeBand.max !== null && user.incomeBand.max < 1600) ? "likely_positive" : "mixed";
      rationale = (verdict === "likely_positive")
        ? "Minimum-wage rise could lift pay toward 1,600€ net."
        : "Already above proposed minimum; indirect effects vary.";
      break;
    case "retirement_age":
      verdict = user.age >= 55 ? "likely_positive" : "mixed";
      rationale = user.age >= 55 ? "Lower legal retirement age could apply sooner." : "Depends on contributions/timeline.";
      break;
    case "prices_energy":
      verdict = "likely_positive"; rationale = "Price caps aim to reduce bill volatility."; break;
    default: break;
  }
  return { verdict, rationale };
}
function summarizeCounts(c) {
  const order = ["likely_positive","mixed","unclear","likely_negative","policy_change"];
  const parts = order.filter(k=>c[k]).map(k=>`${k.replace("_"," ")}: ${c[k]}`);
  return parts.length ? parts.join(" • ") : "No clear effects detected with current answers.";
}
