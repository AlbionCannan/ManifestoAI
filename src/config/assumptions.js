// Spectrum (kept for future use); priority → domain weights; income bracket effects.
export const spectrum = {
  "fr.lfi": -80, "fr.pcf": -75, "fr.eelv": -40, "fr.ps": -20, "fr.re": 10, "fr.lr": 40, "fr.rn": 70,
};

// Domains we will score
export const DOMAINS = ["Cost of Living", "Taxation", "Welfare & Pensions", "Energy", "Immigration", "Overall"];

// How user "priorities" map into domain weights
export const PRIORITY_WEIGHTS = {
  "Cost of living": { "Cost of Living": 1.0, "Taxation": 0.3, "Welfare & Pensions": 0.3 },
  "Jobs & growth": { "Taxation": 0.6, "Cost of Living": 0.4 },
  "Taxation": { "Taxation": 1.0 },
  "Health care": { "Welfare & Pensions": 0.6, "Cost of Living": 0.2 },
  "Pensions & welfare": { "Welfare & Pensions": 1.0 },
  "Immigration": { "Immigration": 1.0 },
  "Security & policing": { "Immigration": 0.5, "Cost of Living": 0.2 },
  "Environment & energy": { "Energy": 1.0, "Cost of Living": 0.2 },
  "Education & research": { "Taxation": 0.2, "Welfare & Pensions": 0.2 },
  "EU integration": { "Taxation": 0.2, "Cost of Living": 0.2 }
};

// Income bracket “tilt” that slightly shifts interpretation (low income benefits from welfare; high from tax cuts)
export const INCOME_TILT = [
  { maxIdx: 2, welfareBias: +0.6, taxBias: -0.3 },   // 0–2k
  { maxIdx: 4, welfareBias: +0.3, taxBias: -0.1 },   // 2–5k
  { maxIdx: 7, welfareBias: 0.0, taxBias: 0.0 },     // 5–10k
  { maxIdx: 8, welfareBias: -0.1, taxBias: +0.2 },   // 10–15k
  { maxIdx: 9, welfareBias: -0.2, taxBias: +0.4 }    // 15–25k+
];
