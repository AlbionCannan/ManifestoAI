// src/lib/policyIndex.js
// Minimal, extensible KB: country -> party -> topic -> { stance, effect, details, source }
export const POLICY_INDEX = {
  France: {
    LFI: {
      wages_minimum: {
        stance: "raise_min_wage",
        effect: { smic_net: 1600 }, // €/mo
        details: "Raise SMIC to 1,600€ net/month; indexation to inflation.",
        source: "https://programme.lafranceinsoumise.fr"
      },
      retirement_age: {
        stance: "lower_retirement",
        effect: { legal_age: 60, contribution_years: 40 },
        details: "Return retirement age to 60 with 40 years of contributions.",
        source: "https://programme.lafranceinsoumise.fr"
      },
      prices_energy: {
        stance: "freeze_prices",
        effect: { energy_price_cap: true },
        details: "Freeze/strictly regulate energy prices during crises.",
        source: "https://programme.lafranceinsoumise.fr"
      }
    },
    RE: {
      wages_minimum: {
        stance: "status_quo_min_wage",
        effect: { smic_indexation: "targeted boosts via bonuses" },
        details: "Maintain current framework; rely on bonuses/in-work incentives.",
        source: "https://parti-renaissance.fr/le-parti"
      },
      retirement_age: {
        stance: "higher_retirement",
        effect: { legal_age: 64 },
        details: "Reform to increase legal retirement age, with exceptions.",
        source: "https://parti-renaissance.fr/le-parti"
      },
      energy_mix: {
        stance: "nuclear_plus_renewables",
        effect: { nuclear_newbuild: true, renewables_scaleup: true },
        details: "Maintain/renew nuclear fleet + accelerate renewables.",
        source: "https://parti-renaissance.fr/le-parti"
      }
    },
    RN: {
      vat_essentials: {
        stance: "lower_vat_essentials",
        effect: { vat_cut: true },
        details: "Lower VAT on essentials to support purchasing power.",
        source: "https://rassemblementnational.fr/livrets-thematiques"
      },
      immigration_rules: {
        stance: "restrictive",
        effect: { eligibility_tighter: true },
        details: "Stricter immigration/asylum rules; priority to nationals in some schemes.",
        source: "https://rassemblementnational.fr/livrets-thematiques"
      }
    },
    PS: {
      health_staffing: {
        stance: "increase_public_hiring",
        effect: { hospital_staff_up: true },
        details: "Hire more in healthcare; reinforce local clinics.",
        source: "https://parti-socialiste.fr/le_programme"
      }
    },
    EELV: {
      building_renovation: {
        stance: "massive_retrofit",
        effect: { retrofit_scale: "massive" },
        details: "Large-scale building retrofit program with social safeguards.",
        source: "https://cf.eelv.fr/projet-des-ecologistes-2022/"
      },
      fossil_subsidies: {
        stance: "phase_out",
        effect: { phaseout_fossil_subsidies: true },
        details: "Phase out fossil fuel subsidies; reallocate to green transition.",
        source: "https://cf.eelv.fr/projet-des-ecologistes-2022/"
      }
    },
    LR: {
      tax_work_prod: {
        stance: "lower_taxes_on_work_prod",
        effect: { employer_charges_down: true },
        details: "Cut taxes/charges on work and production; simplify red tape.",
        source: "https://www.republicains.fr/nos-idees/"
      },
      security_sentencing: {
        stance: "harsher_sentencing",
        effect: { policing_resources_up: true },
        details: "Increase police/judicial resources; tougher sentencing.",
        source: "https://www.republicains.fr/nos-idees/"
      }
    },
    PCF: {
      workweek: {
        stance: "32h_week",
        effect: { legal_hours: 32 },
        details: "Move toward a 32-hour workweek; salary increases; stronger unions.",
        source: "https://www.pcf.fr/le_programme"
      },
      public_ownership: {
        stance: "expand_public_ownership",
        effect: { energy_public_control: true },
        details: "Reinforce public ownership in strategic sectors; price control.",
        source: "https://www.pcf.fr/le_programme"
      }
    },
    REC: {
      immigration_rules: {
        stance: "very_restrictive",
        effect: { eligibility_tighter: true },
        details: "Highly restrictive immigration policy; emphasis on assimilation.",
        source: "https://www.parti-reconquete.fr/programme"
      },
      business_tax: {
        stance: "lower_business_tax",
        effect: { entrepreneur_tax_down: true },
        details: "Lower taxes/charges for entrepreneurs and SMEs.",
        source: "https://www.parti-reconquete.fr/programme"
      }
    }
  }
};
