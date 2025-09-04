// src/lib/policyIndex.js
export const POLICY_INDEX = {
  France: {
    LFI: {
      wages_minimum: {
        stance: "raise_min_wage",
        effect: { smic_net: 1600 },
        details: "Raise SMIC to 1,600€ net/month; indexation to inflation.",
        source: "https://programme.lafranceinsoumise.fr"
      }
    }
  }
};
