// src/App.js
import React, { useMemo, useState } from "react";
import { COUNTRIES, getCandidates } from "./lib/load";
import { analyzeImpact } from "./impactEngine"; // uses your new engine + policyIndex

/* -------------------- Scoped UI Styles (keeps your look) -------------------- */
const ui = {
  page: { padding: 24, minHeight: "100vh" },
  heroH1: { fontSize: 56, fontWeight: 800, margin: "8px 0 6px", textAlign: "center" },
  heroSub: { opacity: 0.85, textAlign: "center", marginBottom: 28 },
  row: { display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" },
  pill: {
    display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 22px",
    borderRadius: 28, background: "#2a79b7", color: "white", fontSize: 20,
    fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
    cursor: "pointer"
  },
  flag: { width: 24, height: 24, borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" },
  sectionH2: { fontSize: 28, fontWeight: 800, margin: "26px 0 12px", textAlign: "center" },
  partyWrap: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 10 },
  partyBtn: {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 16px",
    borderRadius: 999, background: "#2a79b7", color: "#fff", border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.16)", cursor: "pointer", fontWeight: 700
  },
  partyLogo: { width: 22, height: 22, borderRadius: "50%", background: "#fff" },
  lilLink: { color: "#9bd0ff", textDecoration: "none", fontWeight: 600 },

  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "grid", placeItems: "center", zIndex: 50 },
  modalCard: { background: "#eaf5ff", width: "min(980px, 92vw)", borderRadius: 24, padding: 22, border: "1px solid #c7e0ff", color: "#003366" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { fontWeight: 700, marginBottom: 6, display: "block" },
  input: {
    width: "100%", padding: 12, borderRadius: 14, border: "1px solid #cbd5e1",
    background: "#ffffff", fontSize: 15, color: "#003366"
  },
  multi: { width: "100%", padding: 10, borderRadius: 14, border: "1px solid #cbd5e1", background: "#fff", minHeight: 124, color: "#003366" },
  modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 },
  btnPrimary: { padding: "10px 14px", borderRadius: 10, border: "1px solid #256aa0", background: "#2a79b7", color: "#fff", cursor: "pointer", fontWeight: 600 },
  btnGhost: { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d7de", background: "#ccc", color: "#000", cursor: "pointer", fontWeight: 600 },
};

/* -------------------- Country Pills (unchanged look) -------------------- */
const COUNTRY_PILLS = [
  { key: "France",   flag: "https://flagcdn.com/w40/fr.png",  label: "France" },
  { key: "Germany",  flag: "https://flagcdn.com/w40/de.png",  label: "Germany" },
  { key: "Italy",    flag: "https://flagcdn.com/w40/it.png",  label: "Italy" },
  { key: "Spain",    flag: "https://flagcdn.com/w40/es.png",  label: "Spain" },
  { key: "Poland",   flag: "https://flagcdn.com/w40/pl.png",  label: "Poland" }
];

/* -------------------- Optional local policies modal (📄) -------------------- */
/* Minimal placeholders so the 📄 icon always opens something.
   You can expand or delete this section if you prefer only external links. */
const POLICIES = {
  France: {
    LFI: { title: "LFI — Policies", sections: [], source: "https://programme.lafranceinsoumise.fr" },
    PCF: { title: "PCF — Policies", sections: [], source: "https://www.pcf.fr/le_programme" },
    EELV:{ title: "EELV — Policies", sections: [], source: "https://cf.eelv.fr/projet-des-ecologistes-2022/" },
    PS:  { title: "PS — Policies",  sections: [], source: "https://parti-socialiste.fr/le_programme" },
    RE:  { title: "Renaissance — Policies", sections: [], source: "https://parti-renaissance.fr/le-parti" },
    LR:  { title: "LR — Policies",  sections: [], source: "https://www.republicains.fr/nos-idees/" },
    RN:  { title: "RN — Policies",  sections: [], source: "https://rassemblementnational.fr/livrets-thematiques" },
    REC: { title: "Reconquête! — Policies", sections: [], source: "https://www.parti-reconquete.fr/programme" },
  }
};

/* -------------------- Tiny Modal Component (no external deps) -------------------- */
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={ui.modalBackdrop} onClick={onClose}>
      <div style={ui.modalCard} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function PoliciesModal({ open, onClose, country, partyShort, partyName }) {
  if (!open) return null;
  const pack = (POLICIES[country] && POLICIES[country][partyShort]) || null;
  return (
    <Modal open={open} onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>{partyName} ({partyShort}) — Policies</h2>
      {pack?.source && (
        <div style={{ marginBottom: 8 }}>
          Source: <a href={pack.source} target="_blank" rel="noopener noreferrer" style={ui.lilLink}>{pack.source}</a>
        </div>
      )}
      <div style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 14, padding: 16 }}>
        {pack?.sections?.length ? (
          pack.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong>{s.h}</strong>
              <ul style={{ margin: 6, paddingLeft: 18 }}>
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))
        ) : (
          <>No local summary yet. The source link above leads to the official program.</>
        )}
      </div>
      <div style={ui.modalFooter}>
        <button className="btn" onClick={onClose} style={ui.btnGhost}>Close</button>
      </div>
    </Modal>
  );
}

/* -------------------- Helpers -------------------- */
function normalizeCandidate(item) {
  if (typeof item === "string") {
    const m = item.match(/^(.*)\s*\(([^)]+)\)\s*$/);
    return m ? { name: m[1].trim(), short: m[2].trim() } : { name: item, short: item };
  }
  return { name: item.name || item.short, short: item.short || item.name, logo: item.logo, url: item.url };
}

/* -------------------- App (keeps your UI; adds impact hook) -------------------- */
export default function App() {
  const countries = useMemo(() => COUNTRIES ?? [], []);
  const [country, setCountry] = useState(null);
  const [party, setParty] = useState(null);
  const [partyFull, setPartyFull] = useState(null);

  const [showSurvey, setShowSurvey] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [polParty, setPolParty] = useState({ short: null, name: null });

  const [impact, setImpact] = useState(null); // computed but NOT shown unless you add a viewer

  const candidates = useMemo(() => {
    if (!country) return [];
    try { return (getCandidates(country) || []).map(normalizeCandidate); }
    catch { return []; }
  }, [country]);

  function limitConcerns(e) {
    const opts = Array.from(e.target.options);
    const selected = opts.filter(o => o.selected);
    if (selected.length > 3) selected[selected.length - 1].selected = false;
  }

  async function runImpact(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      country,
      party,
      profile: {
        age: form.get("age"),
        gender: form.get("gender"),
        cityRural: form.get("cityRural"),
        income: form.get("income"),
        employment: form.get("employment"),
        home: form.get("home"),
        commute: form.get("commute"),
        concerns: form.getAll("concerns"),
        religion: form.get("religion"),
        race: form.get("race")
      }
    };
    try {
      const r = await analyzeImpact(payload);
      setImpact(r); // stores the neutral mapping (not shown by default)
    } finally {
      setShowSurvey(false);
    }
  }

  return (
    <div style={ui.page}>
      {/* HERO */}
      <h1 style={ui.heroH1}>Manifesto AI</h1>
      <p style={ui.heroSub}>Pick a country, then choose a party to analyze your personal impact.</p>

      {/* COUNTRY PILLS (unchanged) */}
      <div style={ui.row}>
        {COUNTRY_PILLS.map(c => (
          <button key={c.key} style={ui.pill} onClick={() => {
            setCountry(c.key);
            setParty(null);
            setPartyFull(null);
            setImpact(null);
          }}>
            <img src={c.flag} alt={c.label} style={ui.flag} />{c.label}
          </button>
        ))}
      </div>

      {/* PARTY BUTTONS + tiny policies link (no visual overhaul) */}
      {country && (
        <>
          <h2 style={ui.sectionH2}>{country} — Parties</h2>
          <div style={ui.partyWrap}>
            {candidates.map(p => (
              <div key={p.short} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <button
                  style={ui.partyBtn}
                  title={p.name}
                  onClick={() => { setParty(p.short); setPartyFull(p.name); setShowSurvey(true); }}
                >
                  {p.logo && <img src={p.logo} alt={p.name} style={ui.partyLogo} />}
                  {p.name} ({p.short})
                </button>
                <a
                  href="#"
                  onClick={(e)=>{ e.preventDefault(); setPolParty({ short: p.short, name: p.name }); setShowPolicies(true); }}
                  title="Open party policies"
                  style={ui.lilLink}
                >
                  📄
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SURVEY (readable blue text, neutral defaults) */}
      <Modal open={showSurvey} onClose={() => setShowSurvey(false)}>
        <h2 style={{ margin: 0 }}>Your Profile</h2>
        <p>Answer a few questions so we can show how policies in <b>{country}</b>{partyFull ? <> by <b>{partyFull} ({party})</b></> : null} may impact you.</p>

        <form onSubmit={runImpact} style={{ display: "grid", gap: 14 }}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Age</label>
              <input name="age" type="number" min="16" max="99" style={ui.input} />
            </div>

            <div>
              <label style={ui.label}>Gender</label>
              <select name="gender" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>City vs Rural</label>
              <select name="cityRural" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>City</option><option>Town</option><option>Suburban</option><option>Rural</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>Monthly Income (€)</label>
              <select name="income" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>Less than 1,000</option>
                <option>1,000 – 1,999</option>
                <option>2,000 – 2,999</option>
                <option>3,000 – 3,999</option>
                <option>4,000 – 4,999</option>
                <option>5,000 – 6,999</option>
                <option>7,000 – 9,999</option>
                <option>10,000 – 14,999</option>
                <option>15,000 – 19,999</option>
                <option>20,000 – 29,999</option>
                <option>30,000 – 49,999</option>
                <option>50,000 or more</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>Employment Status</label>
              <select name="employment" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>Employed</option><option>Self-employed</option><option>Unemployed</option><option>Student</option><option>Retired</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>Home Ownership</label>
              <select name="home" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>Own</option><option>Rent</option><option>Other</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>Commute Type</label>
              <select name="commute" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>Public Transport</option><option>Car</option><option>Walk</option><option>Bike</option><option>Other</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>Major Concerns (up to 3)</label>
              <select name="concerns" multiple onChange={limitConcerns} style={ui.multi}>
                <option>Economy</option>
                <option>Healthcare</option>
                <option>Environment</option>
                <option>Taxes</option>
                <option>Social Programs</option>
                <option>Immigration</option>
                <option>Security</option>
                <option>Geopolitical Risks</option>
                <option>Digital Regulation</option>
                <option>Discrimination</option>
              </select>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Hold Cmd/Ctrl to select up to 3</div>
            </div>

            <div>
              <label style={ui.label}>Religion (optional)</label>
              <input name="religion" type="text" style={ui.input} />
            </div>

            <div>
              <label style={ui.label}>Race / Ethnicity (optional)</label>
              <select name="race" style={ui.input} defaultValue="">
                <option value="">— Select —</option>
                <option>White</option>
                <option>Black or African American</option>
                <option>Asian</option>
                <option>American Indian or Alaska Native</option>
                <option>Native Hawaiian or Other Pacific Islander</option>
                <option>Hispanic or Latino</option>
                <option>Middle Eastern or North African</option>
                <option>Two or More Races</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div style={ui.modalFooter}>
            <button type="button" onClick={() => setShowSurvey(false)} style={ui.btnGhost}>Cancel</button>
            <button type="submit" style={ui.btnPrimary}>See My Impact</button>
          </div>
        </form>
      </Modal>

      {/* Policies Modal (📄) — unobtrusive */}
      <PoliciesModal
        open={showPolicies}
        onClose={() => setShowPolicies(false)}
        country={country}
        partyShort={polParty.short}
        partyName={polParty.name}
      />

      {/* NOTE: We compute `impact` but don't render any box to keep your UI identical.
         If you ever want to show it, I can add a tiny toggle viewer in seconds. */}
    </div>
  );
}
