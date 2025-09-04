// src/App.js
import React, { useMemo, useState } from "react";
import { COUNTRIES, getCandidates } from "./lib/load";
import { analyzeImpact } from "./impactEngine";

/** ---------- Small style helpers (scoped, no globals) ---------- */
const s = {
  page: { padding: 24, minHeight: "100vh" },
  h1: {
    fontSize: 56, fontWeight: 800, margin: "16px 0 8px", textAlign: "center",
  },
  sub: { opacity: 0.8, textAlign: "center", marginBottom: 28 },
  pillRow: {
    display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", marginBottom: 28,
  },
  pill: {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "16px 22px", borderRadius: 28, boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
    background: "#2a79b7", color: "white", fontSize: 20, fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  },
  flag: { width: 24, height: 24, borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" },
  controls: {
    display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end", maxWidth: 900, margin: "0 auto 24px",
  },
  select: { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d0d7de" },
  btn: {
    padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d7de", cursor: "pointer",
    background: "#e9eef4",
  },
  card: { border: "1px solid #e5e7eb", background: "#0b2236", color: "#fff", borderRadius: 12, padding: 16 },
  resultPre: { whiteSpace: "pre-wrap", margin: 0 },
  sectionTitle: { textAlign: "center", fontSize: 24, fontWeight: 800, margin: "28px 0 8px" },
};

/** ---------- Country pills (hero) ---------- */
const COUNTRY_PILLS = [
  { key: "France",   flag: "https://flagcdn.com/w40/fr.png",  label: "France" },
  { key: "Germany",  flag: "https://flagcdn.com/w40/de.png",  label: "Germany" },
  { key: "Italy",    flag: "https://flagcdn.com/w40/it.png",  label: "Italy" },
  { key: "Spain",    flag: "https://flagcdn.com/w40/es.png",  label: "Spain" },
  { key: "Poland",   flag: "https://flagcdn.com/w40/pl.png",  label: "Poland" },
];

/** ---------- Inline Party Spectrum (logos + abbreviations) ---------- */
const PARTY_DATA = [
  { country: "France", parties: [
    { short: "PCF", name: "Parti communiste français", score: -8, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/PCF_logo_2018.svg" },
    { short: "LFI", name: "La France insoumise",       score: -7, logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/LFI_Logo_2024.svg" },
    { short: "EELV",name: "Europe Écologie – Les Verts",score: -5, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_Europe_%C3%89cologie_Les_Verts.svg" },
    { short: "PS",  name: "Parti socialiste",          score: -4, logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Parti_socialiste_%28France%29_logo_2015.svg" },
    { short: "RE",  name: "Renaissance",               score:  1, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Renaissance-logotype-officiel.svg" },
    { short: "LR",  name: "Les Républicains",          score:  3, logo: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Les_R%C3%A9publicains_-_logo_%28France%2C_2023%29.svg" },
    { short: "REC", name: "Reconquête !",              score:  7, logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Reconqu%C3%AAte_logo_2021.svg" },
    { short: "RN",  name: "Rassemblement national",    score:  8, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Logo_Rassemblement_National.svg" },
  ]},
  { country: "Germany", parties: [
    { short: "Linke", name: "Die Linke", score: -7, logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Die_Linke_logo.svg" },
    { short: "Grüne", name: "Bündnis 90/Die Grünen", score: -3, logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/B%C3%BCndnis_90-Die_Gr%C3%BCnen_Logo.svg" },
    { short: "SPD",   name: "Sozialdemokratische Partei Deutschlands", score: -1, logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/SPD_logo.svg" },
    { short: "BSW",   name: "Bündnis Sahra Wagenknecht", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Logo_B%C3%BCndnis_Sahra_Wagenknecht.svg" },
    { short: "FDP",   name: "Freie Demokratische Partei", score: 2, logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Logo_FDP.svg" },
    { short: "CDU/CSU", name: "Union", score: 3, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/CDU_Logo_2019.svg" },
    { short: "AfD",   name: "Alternative für Deutschland", score: 8, logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/AfD-Logo_2017.svg" },
  ]},
  { country: "Italy", parties: [
    { short: "AVS", name: "Alleanza Verdi e Sinistra", score: -6, logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Alleanza_Verdi_e_Sinistra_logo.svg" },
    { short: "PD",  name: "Partito Democratico", score: -2, logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Partito_Democratico_Logo_2023.svg" },
    { short: "M5S", name: "Movimento 5 Stelle", score: 0,  logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Movimento_5_Stelle_logo_2023.svg" },
    { short: "Azione", name: "Azione", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Azione_logo.svg" },
    { short: "IV",  name: "Italia Viva", score: 2, logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Italia_Viva_logo_2019.svg" },
    { short: "FI",  name: "Forza Italia", score: 4, logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Forza_Italia_logo_2017.svg" },
    { short: "Lega",name: "Lega", score: 6, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Lega_Salvini_Premier_logo.svg" },
    { short: "FdI", name: "Fratelli d'Italia", score: 7, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Fratelli_d%27Italia_logo_2020.svg" },
  ]},
  { country: "Spain", parties: [
    { short: "Podemos", name: "Podemos", score: -6, logo: "https://upload.wikimedia.org/wikipedia/commons/5/58/Podemos_2020_logo.svg" },
    { short: "Sumar",   name: "Sumar", score: -4, logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Sumar_logo_2023.svg" },
    { short: "PSOE",    name: "Partido Socialista Obrero Español", score: -2, logo: "https://upload.wikimedia.org/wikipedia/commons/0/03/PSOE_logo_2022.svg" },
    { short: "PP",      name: "Partido Popular", score: 3, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Partido_Popular_logo_2022.svg" },
    { short: "Vox",     name: "Vox", score: 7, logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Vox_logo.svg" },
  ]},
  { country: "Poland", parties: [
    { short: "Lewica", name: "Lewica", score: -5, logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Lewica_logo.svg" },
    { short: "KO",     name: "Koalicja Obywatelska", score: -1, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Koalicja_Obywatelska_logo.svg" },
    { short: "TD",     name: "Trzecia Droga", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Trzecia_Droga_logo.svg" },
    { short: "PiS",    name: "Prawo i Sprawiedliwość", score: 6, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Prawo_i_Sprawiedliwo%C5%9B%C4%87_logo.svg" },
    { short: "Confed.",name: "Konfederacja", score: 8, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Konfederacja_logo.svg" },
  ]},
];

function PartySpectrum() {
  return (
    <div>
      <h2 style={s.sectionTitle}>Party Spectrum (Left → Right)</h2>
      {PARTY_DATA.map(row => {
        const sorted = [...row.parties].sort((a,b)=>a.score-b.score);
        return (
          <div key={row.country} style={{ margin: "18px 0", textAlign: "center" }}>
            <h3 style={{ margin: "4px 0 12px" }}>{row.country}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {sorted.map(p => (
                <div key={p.short} title={p.name}
                     style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e5e7eb",
                              borderRadius: 999, padding: "6px 12px", background: "#fff" }}>
                  <img src={p.logo} alt={p.name} style={{ width: 22, height: 22, borderRadius: "50%" }}/>
                  <span style={{ fontWeight: 700 }}>{p.short}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** ---------- Simple modal (for your survey) ---------- */
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose}
         style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "grid", placeItems: "center", zIndex: 50 }}>
      <div onClick={(e)=>e.stopPropagation()}
           style={{ background: "white", borderRadius: 16, padding: 20, width: "min(720px,92vw)" }}>
        {children}
      </div>
    </div>
  );
}

/** ---------------------------- APP ---------------------------- */
export default function App() {
  const countries = useMemo(() => COUNTRIES ?? [], []);
  const [country, setCountry] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  const candidates = useMemo(
    () => (country ? getCandidates(country) : []),
    [country]
  );

  async function runImpact(e) {
    e?.preventDefault?.();
    try {
      const r = await analyzeImpact({ country, candidate });
      setResult(r);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setShowModal(false);
    }
  }

  return (
    <div style={s.page}>
      {/* HERO */}
      <h1 style={s.h1}>Manifesto AI</h1>
      <p style={s.sub}>Pick a country, choose a candidate, then analyze your personal impact.</p>

      {/* COUNTRY PILLS */}
      <div style={s.pillRow}>
        {COUNTRY_PILLS.map(c => (
          <button key={c.key} type="button" style={s.pill}
                  onClick={() => { setCountry(c.key); setCandidate(null); setResult(null); }}>
            <img src={c.flag} alt={c.label} style={s.flag} />
            {c.label}
          </button>
        ))}
      </div>

      {/* CONTROLS (appear after choosing country) */}
      <div style={s.controls}>
        <div>
          <label style={{ fontSize: 12, opacity: 0.75 }}>Country</label>
          <select value={country ?? ""} onChange={(e)=>{ setCountry(e.target.value || null); setCandidate(null); setResult(null); }} style={s.select}>
            <option value="">— Select —</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, opacity: 0.75 }}>Party / Candidate</label>
          <select value={candidate ?? ""} onChange={(e)=>setCandidate(e.target.value || null)} disabled={!country} style={s.select}>
            <option value="">— Select —</option>
            {candidates.map(p => (
              <option key={typeof p === "string" ? p : p.short || p.name}
                      value={typeof p === "string" ? p : p.short || p.name}>
                {typeof p === "string" ? p : (p.short || p.name)}
              </option>
            ))}
          </select>
        </div>

        <button style={s.btn} disabled={!country || !candidate} onClick={()=>setShowModal(true)}>
          Analyze Further
        </button>
      </div>

      {/* PARTY SPECTRUM */}
      <PartySpectrum />

      {/* RESULT */}
      <div style={{ maxWidth: 900, margin: "16px auto 0" }}>
        <div style={s.card}>
          <strong>Result:</strong>
          <pre style={s.resultPre}>
{JSON.stringify(result ?? { info: "Choose country & party, then click Analyze Further." }, null, 2)}
          </pre>
        </div>
      </div>

      {/* SURVEY MODAL */}
      <Modal open={showModal} onClose={()=>setShowModal(false)}>
        <h3 style={{ marginTop: 0 }}>Quick Survey</h3>
        <form onSubmit={runImpact} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>Age<input type="number" name="age" min="16" max="99" style={s.select}/></label>
            <label>Monthly Income (€)<input type="number" name="income" style={s.select}/></label>
          </div>
          <label>Employment
            <select name="employment" style={s.select}>
              <option>Employed</option><option>Self-employed</option>
              <option>Unemployed</option><option>Student</option><option>Retired</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={()=>setShowModal(false)} style={s.btn}>Cancel</button>
            <button type="submit" style={s.btn}>Run Impact</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
