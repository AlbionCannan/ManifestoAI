const GERMANY_POLICIES = {
  "Candidate A": [
    { title: "Energy levy reduction",
      appliesTo: _ => true,
      compute: _ => ({ monthlyBenefit: 12 }) },
    { title: "Fuel duty +€0.05/L",
      appliesTo: u => u.commute === "Car",
      compute: _ => ({ monthlyCost: 0.05 * 70 }) }
  ],
  "Candidate B": [
    { title: "Small business social-charge cut",
      appliesTo: u => u.employment === "Self-employed",
      compute: _ => ({ monthlyBenefit: 30 }) }
  ]
};
export default GERMANY_POLICIES;
