// src/impactEngine.js
import { POLICY_INDEX } from "./lib/policyIndex";

/**
 * analyzeImpact({ country, party, profile })
 * Returns { topics: [...], summary } with neutral, sourced explanations.
 */
export async function analyzeImpact({ country, party, profile }) {
  const kbParty = POLICY_INDEX[country]?.[party];
  if (!kbParty) {
    return {
      topics: [],
      summary: `No policy data found for ${party} in ${country}. Add entries to POLICY_INDEX.`,
    };
  }

  const user = normalizeProfile(profile);

  const topics = Object.entries(kbParty).map(([topicKey, policy]) => {
    const impact = scoreImpact(topicKey, policy, user);
    return {
      topic: topicKey,
      verdict: impact.verdict,      // "likely_positive" | "mixed" | "unclear" | "likely_negative" | "policy_change"
      rationale: impact.rationale,  // plain-language reasoning
      details: policy.details,
      source: policy.source,
      signals: impact.signals
    };
  });

  const counts = topics.reduce((acc, t) => {
    acc[t.verdict] = (acc[t.verdict] || 0) + 1;
    return acc;
  }, {});

  return { topics, summary: summarizeCounts(counts) };
}

/** Profile normalization */
function normalizeProfile(p) {
  const incomeBand = parseIncomeBand(String(p.income || ""));
  const age = Number(p.age || 0);
  const isStudent = String(p.employment || "").toLowerCase().includes("student");
  const isRetired = String(p.employment || "").toLowerCase().includes("retired");
  const commute = String(p.commute || "").toLowerCase();
  const locale = String(p.cityRural || "").toLowerCase();
  const concerns = Array.isArray(p.concerns) ? p.concerns : [];

  return { incomeBand, age, isStudent, isRetired, commute, locale, concerns };
}

function parseIncomeBand(label) {
  const clean = label.replace(/[,€]/g, "");
  const m = clean.match(/(\d+)\s*–\s*(\d+)/) || clean.match(/Less than\s*(\d+)/i) || clean.match(/(\d+)\s*or more/i);
  if (!m) return { min: null, max: null, label };
  if (/Less than/i.test(clean)) return { min: 0, max: Number(m[1]), label };
  if (/or more/i.test(clean)) return { min: Number(m[1]), max: null, label };
  return { min: Number(m[1]), max: Number(m[2]), label };
}

/** Transparent rule-based mapping */
function scoreImpact(topicKey, policy, user) {
  const sig = [];
  let verdict = "unclear";
  let rationale = "Insufficient information for a specific effect.";

  switch (topicKey) {
    case "wages_minimum":
      if (user.incomeBand.max !== null && user.incomeBand.max < 1600) {
        verdict = "likely_positive";
        rationale = "Minimum-wage increase could lift monthly pay toward 1,600€ net.";
        sig.push("income < 1,600€");
      } else if (user.incomeBand.min !== null && user.incomeBand.min >= 1600) {
        verdict = "mixed";
        rationale = "You already earn above the proposed minimum; indirect effects depend on sector.";
        sig.push("income ≥ 1,600€");
      }
      break;

    case "retirement_age":
      if (user.age >= 55 && !user.isStudent) {
        verdict = "likely_positive";
        rationale = "Lower legal retirement age could bring eligibility sooner.";
        sig.push("age ≥ 55");
      } else {
        verdict = "mixed";
        rationale = "Effect depends on contribution years and career path.";
      }
      break;

    case "prices_energy":
      verdict = "likely_positive";
      rationale = "Energy price caps aim to reduce household bill volatility.";
      sig.push("household energy consumer");
      break;

    case "energy_mix":
      if (user.concerns.map(x=>x.toLowerCase()).includes("environment")) {
        verdict = "mixed";
        rationale = "Nuclear + renewables can cut emissions; views differ on nuclear risk/cost.";
        sig.push("concern: environment");
      } else {
        verdict = "unclear";
      }
      break;

    case "vat_essentials":
      verdict = "likely_positive";
      rationale = "Lower VAT on essentials typically reduces consumer basket prices.";
      if (user.incomeBand.max !== null && user.incomeBand.max < 2000) {
        rationale += " Lower-income households may benefit more.";
        sig.push("income < 2,000€");
      }
      break;

    case "building_renovation":
      verdict = "mixed";
      rationale = "Retrofit programs can cut bills/emissions; eligibility and timing vary.";
      if (["rural","town"].includes(user.locale)) sig.push("home energy-savings potential");
      break;

    case "tax_work_prod":
      verdict = "mixed";
      rationale = "Lower charges on work/production can support firms/jobs; fiscal trade-offs apply.";
      break;

    case "security_sentencing":
      verdict = "policy_change";
      rationale = "Harsher sentencing and more resources; direct personal impact depends on circumstances.";
      break;

    case "immigration_rules":
      verdict = "policy_change";
      rationale = "Rules would tighten; personal effect depends on status and plans.";
      break;

    default:
      verdict = "unclear";
  }

  return { verdict, rationale, signals: sig };
}

function summarizeCounts(counts) {
  const order = ["likely_positive", "mixed", "unclear", "likely_negative", "policy_change"];
  const parts = order.filter(k => counts[k]).map(k => `${k.replace("_"," ")}: ${counts[k]}`);
  return parts.length ? parts.join(" • ") : "No clear effects detected with current answers.";
}
