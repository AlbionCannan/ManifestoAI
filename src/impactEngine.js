import { getAssumption } from "./config/assumptions";
import { getManifest } from "./lib/load";

// Eligibility checker
function eligible(user, e = {}){
  const inList = (k, v) => !e[k] || e[k].includes(v);
  if (!inList("home_in", user.home)) return false;
  if (!inList("commute_in", user.commute)) return false;
  if (!inList("employment_in", user.employment)) return false;
  if (!inList("location_in", user.location)) return false;

  const inc = Number(user.income || 0);
  if (e.income_lt  !== undefined && !(inc <  e.income_lt))  return false;
  if (e.income_lte !== undefined && !(inc <= e.income_lte)) return false;
  if (e.income_gt  !== undefined && !(inc >  e.income_gt))  return false;
  if (e.income_gte !== undefined && !(inc >= e.income_gte)) return false;

  const age = Number(user.age || 0);
  if (e.age_lt  !== undefined && !(age <  e.age_lt))  return false;
  if (e.age_lte !== undefined && !(age <= e.age_lte)) return false;
  if (e.age_gt  !== undefined && !(age >  e.age_gt))  return false;
  if (e.age_gte !== undefined && !(age >= e.age_gte)) return false;

  return true;
}

// Compute handlers
const COMPUTE = {
  fixed_benefit: ({ params }) => ({ monthlyBenefit: Number(params.amount || 0) }),
  fixed_cost:    ({ params }) => ({ monthlyCost:    Number(params.amount || 0) }),

  vat_delta: ({ params, user, country }) => {
    const delta = Number(params.delta || 0); // +0.01 = +1pp
    const share = Number(params.spend_share ?? getAssumption(country, "vat_spend_share"));
    const inc = Number(user.income || 0);
    return { monthlyCost: delta * share * inc };
  },

  fuel_duty_delta: ({ params, user, country }) => {
    if (user.commute !== "Car") return {};
    const perL   = Number(params.delta_per_liter || 0);
    const liters = Number(params.liters_per_month ?? getAssumption(country, "fuel_liters_per_month"));
    return { monthlyCost: perL * liters };
  },

  self_employed_charge_delta: ({ params, user }) => {
    if (user.employment !== "Self-employed") return {};
    return { monthlyBenefit: Number(params.amount || 0) };
  }
};

function computePolicy(policy, user, country){
  const h = COMPUTE[policy.compute?.type];
  if (!h) return {};
  return h({ params: policy.compute.params || {}, user, country });
}

export function analyzeImpact(user, country, candidate){
  const manifest = getManifest(country, candidate);
  const rows = [];
  let monthlyCost = 0, monthlyBenefit = 0;

  const policies = manifest?.policies || [];
  for (const p of policies){
    if (!eligible(user, p.eligibility, country)) continue;
    const out = computePolicy(p, user, country);
    const cost = Number(out.monthlyCost || 0);
    const ben  = Number(out.monthlyBenefit || 0);
    monthlyCost    += cost;
    monthlyBenefit += ben;
    rows.push({
      id: p.id,
      title: p.title,
      description: p.description,
      source_url: p.source_url,
      effective_date: p.effective_date || null,
      monthlyCost: +cost.toFixed(2),
      monthlyBenefit: +ben.toFixed(2),
      note: p.notes || null
    });
  }

  return {
    country,
    candidate,
    source_manifesto_url: manifest?.source_manifesto_url || "",
    rows,
    monthlyCost: +monthlyCost.toFixed(2),
    monthlyBenefit: +monthlyBenefit.toFixed(2),
    net: +(monthlyBenefit - monthlyCost).toFixed(2)
  };
}
