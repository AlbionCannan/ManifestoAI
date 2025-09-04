import React, { useMemo, useState } from "react";

// Your usual brackets & themes
const INCOME_BRACKETS = [
  "€0–1k / mo", "€1–2k", "€2–3k", "€3–4k", "€4–5k",
  "€5–7k", "€7–10k", "€10–15k", "€15–25k", "€25k+"
];

const PRIORITIES = [
  "Cost of living", "Jobs & growth", "Taxation", "Health care",
  "Pensions & welfare", "Immigration", "Security & policing",
  "Environment & energy", "Education & research", "EU integration"
];

const LIKERT = ["Strongly oppose","Oppose","Neutral","Support","Strongly support"];

export default function QuestionnaireForm({ party }) {
  const [step, setStep] = useState(0);

  const [income, setIncome] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [likert, setLikert] = useState({
    taxCuts: 3,
    welfareIncrease: 3,
    nuclearEnergy: 3,
    immigrationTighten: 3,
  });
  const [intensity, setIntensity] = useState(50); // 0..100

  const canNext = useMemo(() => {
    if (step === 0) return !!income;
    if (step === 1) return priorities.length >= 1; // at least one
    if (step === 2) return true;
    return true;
  }, [step, income, priorities]);

  function togglePriority(p) {
    setPriorities(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p]);
  }

  function finish() {
    const payload = {
      partyId: party.id,
      income,
      priorities,
      likert,
      intensity
    };
    console.log("Questionnaire payload", payload);
    alert("Saved. (Open console to see payload.)");
  }

  return (
    <div className="panel">
      <div className="stepper">
        {[0,1,2,3].map(i => <div key={i} className={`dot ${i<=step?"on":""}`} />)}
      </div>

      {step === 0 && (
        <section className="form">
          <div className="label">Monthly household income bracket</div>
          <div className="chips">
            {INCOME_BRACKETS.map(b => (
              <button key={b}
                className={`chip ${income===b?"sel":""}`}
                onClick={() => setIncome(b)}>{b}</button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="form">
          <div className="label">Your top priorities (choose a few)</div>
          <div className="chips">
            {PRIORITIES.map(p => (
              <button key={p}
                className={`chip ${priorities.includes(p)?"sel":""}`}
                onClick={() => togglePriority(p)}>{p}</button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="form">
          <div className="label">Policy stances</div>
          <LikertRow label="Cut overall taxes" value={likert.taxCuts}
            onChange={v => setLikert(s => ({...s, taxCuts:v}))} />
          <LikertRow label="Increase welfare spending" value={likert.welfareIncrease}
            onChange={v => setLikert(s => ({...s, welfareIncrease:v}))} />
          <LikertRow label="Expand nuclear energy" value={likert.nuclearEnergy}
            onChange={v => setLikert(s => ({...s, nuclearEnergy:v}))} />
          <LikertRow label="Tighten immigration policy" value={likert.immigrationTighten}
            onChange={v => setLikert(s => ({...s, immigrationTighten:v}))} />
        </section>
      )}

      {step === 3 && (
        <section className="form">
          <div className="label">How strongly should your answers weigh the result?</div>
          <input className="slider" type="range" min="0" max="100"
            value={intensity} onChange={e=>setIntensity(+e.target.value)} />
          <div className="muted">Weight: {intensity}%</div>
        </section>
      )}

      <div className="actions">
        <button className="btn" disabled={step===0} onClick={()=>setStep(s=>Math.max(0, s-1))}>Back</button>
        {step < 3 ? (
          <button className="btn primary" disabled={!canNext} onClick={()=>setStep(s=>s+1)}>Next</button>
        ) : (
          <button className="btn primary" onClick={finish}>Finish</button>
        )}
      </div>
    </div>
  );
}

function LikertRow({ label, value, onChange }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="row">
        {LIKERT.map((t, i) => {
          const v = i+1; // 1..5
          return (
            <label key={t} className={`chip ${value===v?"sel":""}`}>
              <input type="radio" name={label} style={{ display:"none" }}
                checked={value===v} onChange={()=>onChange(v)} />
              {t}
            </label>
          );
        })}
      </div>
    </div>
  );
}
