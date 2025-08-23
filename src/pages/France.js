const FRANCE_POLICIES = {
  "Candidate A": [
    {
      title: "Renters’ income-tax credit",
      appliesTo: u => u.home === "Rent",
      compute: _ => ({ monthlyBenefit: 40 })
    },
    {
      title: "Fuel duty +€0.08/L",
      appliesTo: u => u.commute === "Car",
      compute: _ => ({ monthlyCost: 0.08 * 70 }) // ~70 L/mo assumed
    },
    {
      title: "VAT +1%",
      appliesTo: _ => true,
      compute: u => ({ monthlyCost: 0.01 * 0.7 * (u.income || 0) })
    }
  ],
  "Candidate B": [
    {
      title: "Lower income tax (< €2,500/mo)",
      appliesTo: u => u.income < 2500 && ["Employed","Self-employed"].includes(u.employment),
      compute: _ => ({ monthlyBenefit: 25 })
    },
    {
      title: "Discounted public transport pass",
      appliesTo: u => u.commute === "Public Transport",
      compute: _ => ({ monthlyBenefit: 15 })
    }
  ]
};

export default FRANCE_POLICIES;
