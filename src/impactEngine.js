// src/impactEngine.js
// Robust, self-contained engine. It dynamically imports the policy index so
// the app still runs even if ./lib/policyIndex.js is missing or misnamed.

export async function analyzeImpact({ country, party, profile } = {}) {
  // 1) Try to load the policy index dynamically (won’t crash if missing)
  let POLICY_INDEX = null;
  try {
    const mod = await import("./lib/policyIndex.js");
    POLICY_INDEX = mod?.POLICY_INDEX ?? null;
  } catch (e) {
    // Leave POLICY_INDEX = null; we'll fall back to a benign result below.
  }

  // 2) If we have no data for this party, return a harmless result
  if (!POLICY_INDEX || !POLICY_INDEX[country] || !POLICY_INDEX[country][party]) {
    return { topics: [], summary: "No policy data found for this selection." };
  }

  const kbParty = POLICY_INDEX[country][party];
  const user = normalizeProfile(profile || {});

  // 3) Score each policy topic with simple transparent rules
  const topics = Object.entries(kbParty).map(([key, policy]) => {
    const { verdict, rationale } = scoreImpact(key, policy, user);
    return {
      topic: key,
      verdict,                // "likely_positive" | "mixed" | "unclear" | etc.
      rationale,              // short explanation
      details: policy.details,
      source: policy.source
    };
  });

  // 4) Summarize
  const counts = topics.reduce((a, t) => ((a[t.verdict] = (a[t.verdict] || 0) + 1), a), {});
  return { topics, summary: summarizeCounts(counts) };
}

/* ---------- helpers ---------- */

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
  const m =
    clean.match(/(\d+)\s*–\s*(\d+)/) ||
    clean.match(/Less than\s*(\d+)/i) ||
    clean.match(/(\d+)\s*or more/i);
  if (!m) return { min: null, max: null, label };
  if (/Less than/i.test(clean)) return { min: 0, max: Number(m[1]), label };
  if (/or more/i.test(clean)) return { min: Number(m[1]), max: null, label };
  return { min: Number(m[1]), max: Number(m[2]), label };
}

function scoreImpact(topicKey, policy, user) {
  let verdict = "unclear";
  let rationale = "Insufficient information.";

  switch (topicKey) {
    case "wages_minimum": {
      const under1600 = user.incomeBand.max !== null && user.incomeBand.max < 1600;
      verdict = under1600 ? "likely_positive" : "mixed";
      rationale = under1600
        ? "Minimum-wage increase could lift pay toward 1,600€ net."
        : "Already above proposed minimum; indirect effects depend on sector.";
      break;
    }
    case "retirement_age": {
      verdict = user.age >= 55 ? "likely_positive" : "mixed";
      rationale =
        user.age >= 55
          ? "Lower legal retirement age could bring eligibility sooner."
          : "Effect depends on contribution years and timing.";
      break;
    }
    case "prices_energy": {
      verdict = "likely_positive";
      rationale = "Energy price caps/controls aim to reduce bill volatility.";
      break;
    }
    case "energy_mix": {
      const caresEnv = user.concerns.map((x) => x.toLowerCase()).includes("environment");
      verdict = caresEnv ? "mixed" : "unclear";
      rationale = caresEnv
        ? "Nuclear+renewables can cut emissions; views differ on nuclear risk/cost."
        : "Impact depends on priorities and implementation.";
      break;
    }
    case "vat_essentials": {
      verdict = "likely_positive";
      rationale = "Lower VAT on essentials typically reduces basket prices.";
      if (user.incomeBand.max !== null && user.incomeBand.max < 2000) {
        rationale += " Lower-income households may benefit more.";
      }
      break;
    }
    case "building_renovation": {
      verdict = "mixed";
      rationale = "Retrofits can cut bills and emissions; eligibility/timing vary.";
      break;
    }
    case "tax_work_prod": {
      verdict = "mixed";
      rationale = "Lower charges can support firms/jobs; fiscal trade-offs apply.";
      break;
    }
    case "security_sentencing": {
      verdict = "policy_change";
      rationale = "Harsher sentencing/more resources; personal impact is situational.";
      break;
    }
    case "immigration_rules": {
      verdict = "policy_change";
      rationale = "Rules would tighten; effect depends on status/plans.";
      break;
    }
    default:
      // leave as "unclear"
      break;
  }
  return { verdict, rationale };
}

function summarizeCounts(c) {
  const order = ["likely_positive", "mixed", "unclear", "likely_negative", "policy_change"];
  const parts = order.filter((k) => c[k]).map((k) => `${k.replace("_", " ")}: ${c[k]}`);
  return parts.length ? parts.join(" • ") : "No clear effects detected with current answers.";
}
