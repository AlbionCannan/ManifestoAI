import React, { useMemo, useState } from "react";
import { COUNTRY_LIST } from "./policies";
import { analyzeImpact } from "./impactEngine";

export default function App(){
  const countries = useMemo(()=>COUNTRY_LIST, []);
  const [country, setCountry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  function handleAnalyze(){
    if(!country) return;
    setShowModal(true);
  }

  function onSubmit(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const concerns = Array.from(
      e.currentTarget.querySelector("#concerns").selectedOptions
    ).map(o => o.value);
    if(concerns.length > 3){
      alert("Please select up to 3 major concerns.");
      return;
    }

    const user = {
      age: Number(form.get("age") || 0),
      gender: form.get("gender"),
      location: form.get("location"),
      income: Number(form.get("income") || 0),
      employment: form.get("employment"),
      home: form.get("home"),
      commute: form.get("commute"),
      concerns,
      religion: form.get("religion") || null,
      race: form.get("race") || null
    };

    const candidate = window.prompt(`Which candidate in ${country}? (e.g., Candidate A, Candidate B)`) || "Candidate A";
    const out = analyzeImpact(user, country, candidate);
    setResult({ out, user });
    setShowModal(false);
  }

  return (
    <main className="mf-wrap">
      <h1 className="mf-title">Manifesto AI</h1>
      <p className="mf-subtitle">Click a country to explore political insights:</p>

      <div className="mf-country-strip">
        {countries.map(c => (
          <button
            key={c}
            className={"mf-pill" + (country === c ? " mf-pill-active" : "")}
            onClick={()=> setCountry(c)}
          >
            <span className="mf-flag">{flagFor(c)}</span> {c}
          </button>
        ))}
      </div>

      <div className="mf-cta">
        <button className="mf-btn" disabled={!country} onClick={handleAnalyze}>
          Analyze Further
        </button>
      </div>

      {showModal && (
        <div className="mf-modal" onClick={(e)=>{ if(e.target.classList.contains("mf-modal")) setShowModal(false); }}>
          <form className="mf-card" onSubmit={onSubmit}>
            <h3>Your Profile</h3>
            <p className="mf-muted">Answer a few questions so we can show how policies in <b>{country}</b> may impact you.</p>

            <div className="mf-grid">
              <div>
                <label>Age</label>
                <input className="mf-field" name="age" type="number" min="14" max="120" required />
              </div>

              <div>
                <label>Gender</label>
                <select className="mf-field" name="gender" required>
                  <option value="" disabled>Select…</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Prefer not to say</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label>City vs Rural</label>
                <select className="mf-field" name="location" required>
                  <option value="" disabled>Select…</option>
                  <option>City</option>
                  <option>Town/Suburban</option>
                  <option>Rural</option>
                </select>
              </div>

              <div>
                <label>Monthly Income (€)</label>
                <input className="mf-field" name="income" type="number" min="0" step="50" required />
              </div>

              <div>
                <label>Employment Status</label>
                <select className="mf-field" name="employment" required>
                  <option value="" disabled>Select…</option>
                  <option>Employed</option>
                  <option>Self-employed</option>
                  <option>Unemployed</option>
                  <option>Student</option>
                  <option>Retired</option>
                </select>
              </div>

              <div>
                <label>Home Ownership</label>
                <select className="mf-field" name="home" required>
                  <option value="" disabled>Select…</option>
                  <option>Own</option>
                  <option>Rent</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label>Commute Type</label>
                <select className="mf-field" name="commute" required>
                  <option value="" disabled>Select…</option>
                  <option>Public Transport</option>
                  <option>Car</option>
                  <option>Walk</option>
                  <option>Cycle</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label>Major Concerns (up to 3)</label>
                <select className="mf-field" id="concerns" name="concerns" multiple size="6">
                  <option>Economy</option>
                  <option>Healthcare</option>
                  <option>Environment</option>
                  <option>Taxes</option>
                  <option>Social Programs</option>
                  <option>Immigration</option>
                  <option>Education</option>
                  <option>Security</option>
                  <option>Other</option>
                </select>
                <p className="mf-muted">Hold Cmd/Ctrl to multi-select.</p>
              </div>

              <div>
                <label>Religion (optional)</label>
                <input className="mf-field" name="religion" type="text" />
              </div>

              <div>
                <label>Race / Ethnicity (optional)</label>
                <input className="mf-field" name="race" type="text" />
              </div>
            </div>

            <div className="mf-actions">
              <button type="button" className="mf-btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="mf-btn-primary">See My Impact</button>
            </div>
          </form>
        </div>
      )}

      {result && <ImpactPanel data={result} />}
    </main>
  );
}

function ImpactPanel({ data }){
  const { out, user } = data;
  return (
    <section className="mf-impact">
      <h3>Estimated Impact for <b>{out.candidate}</b> in <b>{out.country}</b></h3>
      <p className="mf-muted">
        Profile: {user.employment}, {user.location.toLowerCase()}, commute: {user.commute.toLowerCase()}, income: €{user.income}/mo
      </p>
      <div className="mf-table-wrap">
        <table className="mf-table">
          <thead>
            <tr>
              <th>Policy</th>
              <th style={{textAlign:"right"}}>Benefit / mo</th>
              <th style={{textAlign:"right"}}>Cost / mo</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {out.rows.length ? out.rows.map((r,i)=>(
              <tr key={i}>
                <td>{r.title}</td>
                <td style={{textAlign:"right"}}>€{r.monthlyBenefit.toFixed(2)}</td>
                <td style={{textAlign:"right"}}>€{r.monthlyCost.toFixed(2)}</td>
                <td className="mf-note">{r.note || ""}</td>
              </tr>
            )) : (
              <tr><td colSpan={4}>No direct impacts detected.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mf-totals">
        <span className="mf-chip">Benefits: <b>€{out.monthlyBenefit.toFixed(2)}/mo</b></span>
        <span className="mf-chip">Costs: <b>€{out.monthlyCost.toFixed(2)}/mo</b></span>
        <span className={"mf-chip " + (out.net>=0 ? "mf-chip-pos":"mf-chip-neg")}>
          Net: <b>€{out.net.toFixed(2)}/mo</b>
        </span>
      </div>
    </section>
  );
}

function flagFor(c){
  const map = { France:"🇫🇷", Germany:"🇩🇪", Italy:"🇮🇹", Poland:"🇵🇱", Spain:"🇪🇸" };
  return map[c] || "🏳️";
}
