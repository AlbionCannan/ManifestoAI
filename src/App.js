// src/App.js
import React, { useMemo, useState } from "react";
import { COUNTRIES, getCandidates } from "./lib/load";   // must export these
import { analyzeImpact } from "./impactEngine";          // must export this

// ---------------- Party Spectrum (inline) ---------------- //
const PARTY_DATA = [
  {
    country: "France",
    parties: [
      { short: "PCF", name: "Parti communiste français", score: -8, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/PCF_logo_2018.svg" },
      { short: "LFI", name: "La France insoumise", score: -7, logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/LFI_Logo_2024.svg" },
      { short: "EELV", name: "Europe Écologie – Les Verts", score: -5, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_Europe_%C3%89cologie_Les_Verts.svg" },
      { short: "PS", name: "Parti socialiste", score: -4, logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Parti_socialiste_%28France%29_logo_2015.svg" },
      { short: "RE", name: "Renaissance", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Renaissance-logotype-officiel.svg" },
      { short: "LR", name: "Les Républicains", score: 3, logo: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Les_R%C3%A9publicains_-_logo_%28France%2C_2023%29.svg" },
      { short: "REC", name: "Reconquête !", score: 7, logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Reconqu%C3%AAte_logo_2021.svg" },
      { short: "RN", name: "Rassemblement national", score: 8, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Logo_Rassemblement_National.svg" }
    ]
  },
  {
    country: "Germany",
    parties: [
      { short: "Linke", name: "Die Linke", score: -7, logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Die_Linke_logo.svg" },
      { short: "Grüne", name: "Bündnis 90/Die Grünen", score: -3, logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/B%C3%BCndnis_90-Die_Gr%C3%BCnen_Logo.svg" },
      { short: "SPD", name: "Sozialdemokratische Partei Deutschlands", score: -1, logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/SPD_logo.svg" },
      { short: "FDP", name: "Freie Demokratische Partei", score: 2, logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Logo_FDP.svg" },
      { short: "CDU/CSU", name: "Union", score: 3, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/CDU_Logo_2019.svg" },
      { short: "BSW", name: "Bündnis Sahra Wagenknecht", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Logo_B%C3%BCndnis_Sahra_Wagenknecht.svg" },
      { short: "AfD", name: "Alternative für Deutschland", score: 8, logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/AfD-Logo_2017.svg" }
    ]
  },
  {
    country: "Italy",
    parties: [
      { short: "AVS", name: "Alleanza Verdi e Sinistra", score: -6, logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Alleanza_Verdi_e_Sinistra_logo.svg" },
      { short: "PD", name: "Partito Democratico", score: -2, logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Partito_Democratico_Logo_2023.svg" },
      { short: "M5S", name: "Movimento 5 Stelle", score: 0, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Movimento_5_Stelle_logo_2023.svg" },
      { short: "Azione", name: "Azione", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Azione_logo.svg" },
      { short: "IV", name: "Italia Viva", score: 2, logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Italia_Viva_logo_2019.svg" },
      { short: "FI", name: "Forza Italia", score: 4, logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Forza_Italia_logo_2017.svg" },
      { short: "Lega", name: "Lega", score: 6, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Lega_Salvini_Premier_logo.svg" },
      { short: "FdI", name: "Fratelli d'Italia", score: 7, logo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Fratelli_d%27Italia_logo_2020.svg" }
    ]
  },
  {
    country: "Spain",
    parties: [
      { short: "Podemos", name: "Podemos", score: -6, logo: "https://upload.wikimedia.org/wikipedia/commons/5/58/Podemos_2020_logo.svg" },
      { short: "Sumar", name: "Sumar", score: -4, logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Sumar_logo_2023.svg" },
      { short: "PSOE", name: "Partido Socialista Obrero Español", score: -2, logo: "https://upload.wikimedia.org/wikipedia/commons/0/03/PSOE_logo_2022.svg" },
      { short: "PP", name: "Partido Popular", score: 3, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Partido_Popular_logo_2022.svg" },
      { short: "Vox", name: "Vox", score: 7, logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Vox_logo.svg" }
    ]
  },
  {
    country: "Poland",
    parties: [
      { short: "Lewica", name: "Lewica", score: -5, logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Lewica_logo.svg" },
      { short: "KO", name: "Koalicja Obywatelska", score: -1, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Koalicja_Obywatelska_logo.svg" },
      { short: "TD", name: "Trzecia Droga", score: 1, logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Trzecia_Droga_logo.svg" },
      { short: "PiS", name: "Prawo i Sprawiedliwość", score: 6, logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Prawo_i_Sprawiedliwo%C5%9B%C4%87_logo.svg" },
      { short: "Confed.", name: "Konfederacja", score: 8, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Konfederacja_logo.svg" }
    ]
  }
];

function PartySpectrum() {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ textAlign: "center" }}>Party Spectrum (Left → Right)</h2>
      {PARTY_DATA.map((row) => {
        const sorted = [...row.parties].sort((a, b) => a.score - b.score);
        return (
          <div key={row.country} style={{ margin: "20px 0", textAlign: "center" }}>
            <h3>{row.country}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {sorted.map((p) => (
                <div key={p.short} title={p.name}
                  style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #ddd", borderRadius: 20, padding: "4px 10px", background: "#fff" }}>
                  <img src={p.logo} alt={p.name} style={{ width: 24, height: 24, borderRadius: "50%" }}/>
                  <span style={{ fontWeight: "bold" }}>{p.short}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Modal ---------------- //
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div style={{ background: "white", padding: 20, borderRadius: 12, minWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ---------------- App ---------------- //
export default function App() {
  const countries = useMemo(() => COUNTRIES ?? [], []);
  const [country, setCountry] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  const candidates = useMemo(() => (country ? getCandidates(country) : []), [country]);

  function openSurvey() {
    if (!country || !candidate) return;
    setShowModal(true);
  }

  async function runImpact(e) {
    e.preventDefault();
    try {
      const r = await analyzeImpact({ country, candidate });
      setResult(r);
    } catch (err) {
      setResult({ error: String(err) });
    }
    setShowModal(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>ManifestoAI</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select value={country ?? ""} onChange={(e) => setCountry(e.target.value || null)}>
          <option value="">Select Country</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select value={candidate ?? ""} onChange={(e) => setCandidate(e.target.value || null)} disabled={!country}>
          <option value="">Select Party</option>
          {candidates.map((p) => (
            <option key={typeof p === "string" ? p : p.short || p.name}>
              {typeof p === "string" ? p : p.short || p.name}
            </option>
          ))}
        </select>

        <button onClick={openSurvey} disabled={!country || !candidate}>Analyze</button>
      </div>

      <PartySpectrum />

      <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
        <strong>Result:</strong>
        <pre>{JSON.stringify(result ?? { info: "Pick a country & party" }, null, 2)}</pre>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h3>Quick Survey</h3>
        <form onSubmit={runImpact} style={{ display: "grid", gap: 10 }}>
          <input type="number" name="age" placeholder="Age"/>
          <input type="number" name="income" placeholder="Monthly Income €"/>
          <select name="employment">
            <option>Employed</option>
            <option>Self-employed</option>
            <option>Unemployed</option>
            <option>Student</option>
            <option>Retired</option>
          </select>
          <button type="submit">Run Impact</button>
        </form>
      </Modal>
    </div>
  );
}
