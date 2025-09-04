// src/App.js
import React, { useMemo, useState } from "react";
import { COUNTRIES, getCandidates } from "./lib/load"; // must export both
import { analyzeImpact } from "./impactEngine";        // must export analyzeImpact
import PartySpectrum from "./PartySpectrum";           // the logos+abbrev component

// A tiny, self-contained modal so App.js doesn't depend on any other UI files.
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, display: "grid", placeItems: "center",
        background: "rgba(0,0,0,0.5)", zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(720px, 92vw)",
          background: "white",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

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

  function openSurvey() {
    if (!country || !candidate) return;
    setShowModal(true);
  }

  async function runImpact(e) {
    e?.preventDefault?.();
    try {
      // You can pass whatever structure your engine expects:
      const r = await analyzeImpact({ country, candidate });
      setResult(r);
      setShowModal(false);
    } catch (err) {
      console.error("analyzeImpact failed:", err);
      setResult({ error: String(err) });
      setShowModal(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>ManifestoAI — Demo</h1>

      {/* Controls */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: 12,
        alignItems: "end",
        marginBottom: 24
      }}>
        <div>
          <label style={{ display: "block", fontSize: 12, opacity: 0.7 }}>Country</label>
          <select
            value={country ?? ""}
            onChange={(e) => {
              const c = e.target.value || null;
              setCountry(c);
              setCandidate(null);
              setResult(null);
            }}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">— Select —</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, opacity: 0.7 }}>Party / Candidate</label>
          <select
            value={candidate ?? ""}
            onChange={(e) => {
              const v = e.target.value || null;
              setCandidate(v);
              setResult(null);
            }}
            disabled={!country}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">— Select —</option>
            {candidates.map((p) => (
              // accept either {short, name} or plain string
              <option key={typeof p === "string" ? p : p.short || p.name}
                      value={typeof p === "string" ? p : p.short || p.name}>
                {typeof p === "string" ? p : (p.short || p.name)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openSurvey}
          disabled={!country || !candidate}
          style={{ padding: "10px 14px" }}
        >
          Analyze
        </button>
      </div>

      {/* Party spectrum (logos + abbreviations, left→right) */}
      <div style={{ marginBottom: 24 }}>
        <PartySpectrum />
      </div>

      {/* Results */}
      <div style={{
        border: "1px solid #eee", borderRadius: 12, padding: 16,
        minHeight: 80, background: "#fafafa"
      }}>
        <strong>Result</strong>
        <pre style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(result ?? { info: "Pick a country & party, then click Analyze." }, null, 2)}
        </pre>
      </div>

      {/* The simple survey modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h3 style={{ marginTop: 0 }}>Quick Survey</h3>
        <form onSubmit={runImpact} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Age
              <input type="number" name="age" min="16" max="99" style={{ width: "100%", padding: 8 }}/>
            </label>
            <label>
              Monthly Income (€)
              <input type="number" name="income" style={{ width: "100%", padding: 8 }}/>
            </label>
          </div>
          <label>
            Employment Status
            <select name="employment" style={{ width: "100%", padding: 8 }}>
              <option>Employed</option>
              <option>Self-employed</option>
              <option>Unemployed</option>
              <option>Student</option>
              <option>Retired</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit">Run Impact</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
