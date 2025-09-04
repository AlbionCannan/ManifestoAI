// src/lib/policyIndex.js
export const POLICY_INDEX = {
  France: {
    LFI: {
      wages_minimum: {
        stance: "raise_min_wage",
        effect: { smic_net: 1600 },
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
        details: "Freeze or tightly regulate household energy prices during crises.",
        source: "https://programme.lafranceinsoumise.fr"
      }
    },
    RE: {
      retirement_age: {
        stance: "higher_retirement",
        effect: { legal_age: 64 },
        details: "Increase legal retirement age (with exceptions).",
        source: "https://parti-renaissance.fr/le-parti"
      },
      energy_mix: {
        stance: "nuclear_plus_renewables",
        effect: { nuclear_newbuild: true, renewables_scaleup: true },
        details: "Maintain/renew nuclear fleet and accelerate renewables.",
        source: "https://parti-renaissance.fr/le-parti"
      }
    },
    RN: {
      vat_essentials: {
        stance: "lower_vat_essentials",
        effect: { vat_cut: true },
        details: "Lower VAT on essentials to support purchasing power.",
        source: "https://rassemblementnational.fr/livrets-thematiques"
      }
    },
    PS: {
      health_staffing: {
        stance: "increase_public_hiring",
        effect: { hospital_staff_up: true },
        details: "Hire more for hospitals and local clinics.",
        source: "https://parti-socialiste.fr/le_programme"
      }
    },
    EELV: {
      building_renovation: {
        stance: "massive_retrofit",
        effect: { retrofit_scale: "massive" },
        details: "Large-scale retrofit program with social safeguards.",
        source: "https://cf.eelv.fr/projet-des-ecologistes-2022/"
      }
    },
    LR: {
      tax_work_prod: {
        stance: "lower_taxes_on_work_prod",
        effect: { employer_charges_down: true },
        details: "Cut charges on work/production; simplify regulation.",
        source: "https://www.republicains.fr/nos-idees/"
      }
    },
    PCF: {
      workweek: {
        stance: "32h_week",
        effect: { legal_hours: 32 },
        details: "Move toward a 32-hour week; wage hikes; stronger unions.",
        source: "https://www.pcf.fr/le_programme"
      }
    },
    REC: {
      business_tax: {
        stance: "lower_business_tax",
        effect: { entrepreneur_tax_down: true },
        details: "Lower taxes/charges for entrepreneurs and SMEs.",
        source: "https://www.parti-reconquete.fr/programme"
      }
    }
  }
};
