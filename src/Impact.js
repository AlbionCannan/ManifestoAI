import { getPolicies } from "./policies";

export function analyzeImpact(user, country, candidate){
  const pack = getPolicies(country, candidate);
  const rows = [];
  let monthlyCost = 0, monthlyBenefit = 0;

  for(const p of pack){
    if(!p.appliesTo || p.appliesTo(user)){
      const out = p.compute ? p.compute(user) : {};
      const cost = Number(out.monthlyCost || 0);
      const benefit = Number(out.monthlyBenefit || 0);
      monthlyCost += cost;
      monthlyBenefit += benefit;
      rows.push({
        title: p.title,
        monthlyCost: +cost.toFixed(2),
        monthlyBenefit: +benefit.toFixed(2),
        note: out.note || null
      });
    }
  }

  return {
    country, candidate, rows,
    monthlyCost: +monthlyCost.toFixed(2),
    monthlyBenefit: +monthlyBenefit.toFixed(2),
    net: +(monthlyBenefit - monthlyCost).toFixed(2)
  };
}
