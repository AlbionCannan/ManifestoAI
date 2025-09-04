// src/App.js
import React, { useMemo, useState } from "react";
import { COUNTRIES, getCandidates } from "./lib/load";
import { analyzeImpact } from "./impactEngine";

/** ========== Tiny style system (scoped) ========== */
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end", maxWidth: 920, margin: "0 auto 22px" },
  select: { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d0d7de" },
  btn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d7de", background: "#e9eef4", cursor: "pointer" },
  card: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#0b2236", color: "#fff" },
  resultPre: { whiteSpace: "pre-wrap", margin: 0 },
  partyWrap: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 10 },
  partyBtn: {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 16px",
    borderRadius: 999, background: "#2a79b7", color: "#fff", border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.16)", cursor: "pointer", fontWeight: 700
  },
  partyLogo: { width: 22, height: 22, borderRadius: "50%", background: "#fff" },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "grid", placeItems: "center", zIndex: 50 },
  modalCard: { background: "#eaf5ff", width: "min(980px, 92vw)", borderRadius: 24, padding: 22, border: "1px solid #c7e0ff" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { fontWeight: 700, marginBottom: 6, display: "block" },
  input: {
    width: "100%", padding: 12, borderRadius: 14, border: "1px solid #cbd5e1",
    background: "#ffffff", fontSize: 15
  },
  multi: { width: "100%", padding: 10, borderRadius: 14, border: "1px solid #cbd5e1", background: "#fff", minHeight: 124 },
  help: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }
};

/** Country pills for the hero */
const COUNTRY_PILLS = [
  { key: "France",   flag: "https://flagcdn.com/w40/fr.png",  label: "France" },
  { key: "Germany",  flag: "https://flagcdn.com/w40/de.png",  label: "Germany" },
  { key: "Italy",    flag: "https://flagcdn.com/w40/it.png",  label: "Italy" },
  { key: "Spain",    flag: "https://flagcdn.com/w40/es.png",  label: "Spain" },
  { key: "Poland",   flag: "https://flagcdn.com/w40/pl.png",  label: "Poland" }
];

/** Simple modal */
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={ui.modalBackdrop} onClick={onClose}>
      <div style={ui.modalCard} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/** Utility: normalize candidate item from getCandidates() to {short,name,logo,label} */
function normalizeCandidate(item) {
  if (typeof item === "string") {
    // Try to extract abbrev in parentheses: "Parti Socialiste (PS)" -> short: PS
    const m = item.match(/^(.*)\\s*\\(([^)]+)\\)\\s*$/);
    return m ? { name: m[1].trim(), short: m[2].trim(), label: m[2].trim() } : { name: item, short: item, label: item };
  }
  const short = item.short || item.abbrev || item.code || item.name;
  const name = item.name || item.full || short;
  return { name, short, logo: item.logo, label: short };
}

/** ====== Main App ====== */
export default function App() {
  const countries = useMemo(() => COUNTRIES ?? [], []);
  const [country, setCountry] = useState(null);
  const [party, setParty] = useState(null); // string short label
  const [partyFull, setPartyFull] = useState(null); // full name for copy
  const [showSurvey, setShowSurvey] = useState(false);
  const [result, setResult] = useState(null);

  const candidates = useMemo(() => {
    if (!country) return [];
    try { return (getCandidates(country) || []).map(normalizeCandidate); }
    catch { return []; }
  }, [country]);

  /** limiter: allow max 3 major concerns */
  function limitConcerns(e) {
    const opts = Array.from(e.target.options);
    const selected = opts.filter(o => o.selected);
    if (selected.length > 3) {
      // unselect the last toggled option
      const last = selected[selected.length - 1];
      last.selected = false;
    }
  }

  async function runImpact(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      country,
      party,
      profile: {
        age: Number(form.get("age") || 0),
        gender: String(form.get("gender") || ""),
        cityRural: String(form.get("cityRural") || ""),
        incomeMonthly: Number(form.get("income") || 0),
        employment: String(form.get("employment") || ""),
        home: String(form.get("home") || ""),
        commute: String(form.get("commute") || ""),
        concerns: form.getAll("concerns"),
        religion: String(form.get("religion") || ""),
        raceEthnicity: String(form.get("race") || "")
      }
    };
    try {
      const r = await analyzeImpact(payload);
      setResult(r);
    } catch (err) {
      setResult({ error: String(err), input: payload });
    } finally {
      setShowSurvey(false);
    }
  }

  return (
    <div style={ui.page}>
      {/* HERO */}
      <h1 style={ui.heroH1}>Manifesto AI</h1>
      <p style={ui.heroSub}>Pick a country, then choose a party to analyze your personal impact.</p>

      {/* COUNTRY PILLS */}
      <div style={ui.row}>
        {COUNTRY_PILLS.map(c => (
          <button key={c.key} style={ui.pill} onClick={() => {
            setCountry(c.key);
            setParty(null);
            setPartyFull(null);
            setResult(null);
          }}>
            <img src={c.flag} alt={c.label} style={ui.flag} />
            {c.label}
          </button>
        ))}
      </div>

      {/* If a country is chosen, reveal party buttons */}
      {country && (
        <>
          <h2 style={ui.sectionH2}>{country} — Parties</h2>
          <div style={ui.partyWrap}>
            {candidates.map(p => (
              <button key={p.label}
                style={ui.partyBtn}
                title={p.name}
                onClick={() => {
                  setParty(p.short);
                  setPartyFull(p.name);
                  setShowSurvey(true);
                }}
              >
                {p.logo && <img src={p.logo} alt={p.name} style={ui.partyLogo} />}
                <span>{p.short}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* RESULT */}
      <div style={{ maxWidth: 980, margin: "26px auto 0" }}>
        <div style={ui.card}>
          <strong>Result:</strong>
          <pre style={ui.resultPre}>
{JSON.stringify(result ?? { info: "Choose a country, click a party, complete the survey." }, null, 2)}
          </pre>
        </div>
      </div>

      {/* SURVEY (detailed) */}
      <Modal open={showSurvey} onClose={() => setShowSurvey(false)}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Your Profile</h2>
        <p style={{ marginTop: 8, marginBottom: 18, opacity: 0.8 }}>
          Answer a few questions so we can show how policies in <b>{country || "—"}</b>
          {partyFull ? <> by <b>{partyFull} ({party})</b></> : null} may impact you.
        </p>

        <form onSubmit={runImpact} style={{ display: "grid", gap: 14 }}>
          <div style={ui.formGrid}>
            <div>
              <label style={ui.label}>Age</label>
              <input name="age" type="number" min="16" max="99" style={ui.input} />
            </div>
            <div>
              <label style={ui.label}>Gender</label>
              <select name="gender" style={ui.input}>
                <option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>City vs Rural</label>
              <select name="cityRural" style={ui.input}>
                <option>City</option><option>Suburban</option><option>Rural</option>
              </select>
            </div>
            <div>
              <label style={ui.label}>Monthly Income (€)</label>
              <input name="income" type="number" style={ui.input} />
            </div>

            <div>
              <label style={ui.label}>Employment Status</label>
              <select name="employment" style={ui.input}>
                <option>Employed</option><option>Self-employed</option>
                <option>Unemployed</option><option>Student</option><option>Retired</option>
              </select>
            </div>
            <div>
              <label style={ui.label}>Home Ownership</label>
              <select name="home" style={ui.input}>
                <option>Own</option><option>Rent</option><option>Other</option>
              </select>
            </div>

            <div>
              <label style={ui.label}>Commute Type</label>
              <select name="commute" style={ui.input}>
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
              </select>
              <div style={ui.help}>Hold Cmd/Ctrl to multi-select. Max 3 will be recorded.</div>
            </div>

            <div>
              <label style={ui.label}>Religion (optional)</label>
              <input name="religion" type="text" style={ui.input} />
            </div>
            <div>
              <label style={ui.label}>Race / Ethnicity (optional)</label>
              <input name="race" type="text" style={ui.input} />
            </div>
          </div>

          <div style={ui.modalFooter}>
            <button type="button" onClick={() => setShowSurvey(false)} style={ui.btn}>Cancel</button>
            <button type="submit" style={{ ...ui.btn, background: "#2a79b7", color: "#fff", borderColor: "#256aa0" }}>
              See My Impact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
