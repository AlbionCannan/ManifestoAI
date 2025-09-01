export const DEFAULT_ASSUMPTIONS = {
  general: {
    vat_spend_share: 0.70,       // share of income exposed to VAT
    fuel_liters_per_month: 70    // default car fuel usage per month
  },
  byCountry: {
    France: {},
    Germany: {},
    Italy: {},
    Poland: {},
    Spain: {}
  }
};

export function getAssumption(country, key){
  const map = DEFAULT_ASSUMPTIONS.byCountry[country] || {};
  if (key in map) return map[key];
  return DEFAULT_ASSUMPTIONS.general[key];
}
