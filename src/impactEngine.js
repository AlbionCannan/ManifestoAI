// src/impactEngine.js
import { POLICY_INDEX } from "./lib/policyIndex";

export async function analyzeImpact({ country, party, profile }) {
  const kbParty = POLICY_INDEX[country]?.[party];
  if (!kbParty) return { topics: [], summary: `No policy data for ${party} in ${country}.` };

  const user = normalizeProfile(profile);

  const topics = Object.entries(kbParty).map(([key, policy]) => {
    const { verdict, rationale, signals } = scoreImpact(key, policy, user);
    return { topic: key, verdict, rationale, details: policy.details, source: policy.source, signals };
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
  const sig = [];
  let verdict = "unclear";
  let rationale = "Insufficient information.";

  switch (topicKey) {
    case "wages_minimum":
      if (user.incomeBand.max !== null && user.incomeBand.max < 1600) {
        verdict = "likely_positive"; rationale = "Minimum-wage rise could lift pay toward 1,600€ net."; sig.push("income < 1,600€");
      } else if (user.incomeBand.min !== null && user.incomeBand.min >= 1600) {
        verdict = "mixed"; rationale = "Already above proposed minimum; indirect effects vary."; sig.push("income ≥ 1,600€");
      }
      break;
    case "retirement_age":
      verdict = user.age >= 55 ? "likely_positive" : "mixed";
      rationale = user.age >= 55 ? "Lower legal retirement age could apply sooner." : "Effect depends on contributions/timeline.";
      break;
    case "prices_energy":
      verdict = "likely_positive"; rationale = "Price caps aim to reduce bill volatility."; sig.push("household energy consumer");
      break;
    case "energy_mix":
      verdict = user.concerns.map(x=>x.toLowerCase()).includes("environment") ? "mixed" : "unclear";
      rationale = verdict === "mixed" ? "Nuclear+renewables lower emissions; views differ on nuclear." : "Impact depends on priorities.";
      break;
    case "vat_essentials":
      verdict = "likely_positive"; rationale = "Lower VAT on essentials can reduce basket prices.";
      if (user.incomeBand.max !== null && user.incomeBand.max < 2000) { rationale += " Larger effect at lower incomes."; sig.push("income < 2,000€"); }
      break;
    case "building_renovation":
      verdict = "mixed"; rationale = "Retrofits can cut bills/emissions; eligibility/timing vary.";
      if (["rural","town"].includes(user.locale)) sig.push("home energy-savings potential");
      break;
    case "tax_work_prod":
      verdict = "mixed"; rationale = "Lower charges may support firms/jobs; fiscal trade-offs apply.";
      break;
    default: break;
  }
  return { verdict, rationale, signals: sig };
}
function summarizeCounts(c) {
  const order = ["likely_positive","mixed","unclear","likely_negative","policy_change"];
  const parts = order.filter(k=>c[k]).map(k=>`${k.replace("_"," ")}: ${c[k]}`);
  return parts.length ? parts.join(" • ") : "No clear effects detected with current answers.";
}
