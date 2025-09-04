import { DOMAINS, PRIORITY_WEIGHTS, INCOME_TILT } from "../config/assumptions";

/**
 * Convert a user's questionnaire answers (1..5 Likert, priorities, income bracket, intensity 0..100)
 * and a party policy vector (1..5 each) into per-domain impacts in the range -100..+100.
 */
export function computeImpact(profile, party) {
  const weightsByDomain = baseDomainWeights(profile.priorities);
  const likert = profile.likert;             // { taxCuts, welfareIncrease, nuclearEnergy, immigrationTighten } 1..5
  const pol = party.policies;                // same keys, 1..5
  const intensity = (profile.intensity ?? 50) / 100; // 0..1

  // Income tilt
  const incomeIndex = profile.incomeIndex ?? 0;
  const tilt = pickIncomeTilt(incomeIndex);

  // Normalize difference (0..4) → (-1..+1)
  const diff = (u, p) => ((p - u) / 4);

  // Raw alignment per policy
  const align = {
    taxation: diff(likert.taxCuts, pol.taxCuts) + (tilt.taxBias || 0),
    welfare: diff(likert.welfareIncrease, pol.welfareIncrease) + (tilt.welfareBias || 0),
    energy:  diff(likert.nuclearEnergy,  pol.nuclearEnergy),
    immigration: diff(likert.immigrationTighten, pol.immigrationTighten),
  };

  // Map to domains
  let domainScores = {
    "Taxation": align.taxation,
    "Welfare & Pensions": align.welfare,
    "Energy": align.energy,
    "Immigration": align.immigration,
    "Cost of Living": (
      // cheaper energy helps CoL; tax cuts help some; welfare helps vulnerable – blend with small weights
      (-0.2 * align.taxation) + (0.25 * align.welfare) - (0.3 * align.energy)
    )
  };

  // Weight by user priorities
  for (const d of Object.keys(domainScores)) {
    domainScores[d] = clamp01(domainScores[d]) * (1 + (weightsByDomain[d] || 0) * 0.3);
  }

  // Scale to -100..+100 and intensity
  const out = {};
  let total = 0, w = 0;
  for (const d of DOMAINS.filter(x => x !== "Overall")) {
    const scaled = clamp100(domainScores[d] * 100 * intensity);
    out[d] = Math.round(scaled);
    total += scaled * (1 + (weightsByDomain[d] || 0));
    w += 1 + (weightsByDomain[d] || 0);
  }
  out["Overall"] = Math.round(total / Math.max(1, w));

  const narrative = buildNarrative(out, party.name);
  return { breakdown: out, narrative };
}

function baseDomainWeights(prios) {
  const weights = {};
  (prios || []).forEach(p => {
    const map = PRIORITY_WEIGHTS[p];
    if (map) {
      for (const [d, v] of Object.entries(map)) {
        weights[d] = (weights[d] || 0) + v;
      }
    }
  });
  return weights;
}

function pickIncomeTilt(idx){
  for (const t of INCOME_TILT) if (idx <= t.maxIdx) return t;
  return { welfareBias: 0, taxBias: 0 };
}

function clamp01(x){ return Math.max(-1, Math.min(1, x)); }
function clamp100(x){ return Math.max(-100, Math.min(100, x)); }

function buildNarrative(scores, partyName){
  const pos = [], neg = [];
  for (const [k,v] of Object.entries(scores)) {
    if (k === "Overall") continue;
    if (v >= 10) pos.push(`${k.toLowerCase()}`);
    if (v <= -10) neg.push(`${k.toLowerCase()}`);
  }
  const pieces = [];
  pieces.push(`Based on your answers, ${partyName} would have an overall impact of ${fmt(scores.Overall)} on you.`);
  if (pos.length) pieces.push(`Potential positives: ${pos.join(", ")}.`);
  if (neg.length) pieces.push(`Potential downsides: ${neg.join(", ")}.`);
  if (!pos.length && !neg.length) pieces.push(`Impacts are mixed and close to neutral across domains.`);
  return pieces.join(" ");
}

function fmt(n){ return (n>0?`+${n}`: `${n}`); }
