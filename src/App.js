import React from "react";
import { BrowserRouter, Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import "./countryPortals.css";
import { loadManifestos } from "./lib/load";

function Header() {
  return (
    <header className="shell">
      <div className="hero">
        <h1 className="grad">Manifesto AI</h1>
        <p className="sub">Explore parties by country, then take the questionnaire to see policy impact on you.</p>
      </div>
    </header>
  );
}

function Countries() {
  const data = loadManifestos();
  const nav = useNavigate();
  return (
    <main className="container">
      <div className="grid">
        {(data.countries || []).map(c => (
          <button key={c.code} className="card clickable"
            onClick={() => nav(`/${c.code}`)}>
            <div className="flag">{c.flag || "🌍"}</div>
            <div className="title">{c.name}</div>
            <div className="hint">View parties →</div>
          </button>
        ))}
      </div>
    </main>
  );
}

function Parties() {
  const { countryCode } = useParams();
  const data = loadManifestos();
  const country = (data.countries || []).find(c => c.code === countryCode);
  if (!country) {
    return <main className="container"><div className="empty">Unknown country.</div></main>;
  }
  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/" className="crumb">Countries</Link>
        <span className="crumb sep">/</span>
        <span className="crumb">{country.name}</span>
      </nav>

      <h2 className="sectionTitle">Parties in {country.name}</h2>
      <div className="grid">
        {(country.parties || []).map(p => (
          <Link key={p.id} to={`/${country.code}/${p.id}`} className="card">
            <div className="partyRow">
              <div className="logo">{p.logo ? <img src={p.logo} alt="" /> : "🏛️"}</div>
              <div>
                <div className="title">{p.name}</div>
                <div className="muted">{p.ideology || "—"}</div>
              </div>
            </div>
            <div className="hint">Open questionnaire →</div>
          </Link>
        ))}
      </div>
    </main>
  );
}

function Questionnaire() {
  const { countryCode, partyId } = useParams();
  const data = loadManifestos();
  const country = (data.countries || []).find(c => c.code === countryCode);
  const party = country?.parties?.find(p => p.id === partyId);

  if (!country || !party) {
    return <main className="container"><div className="empty">Not found.</div></main>;
  }

  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/" className="crumb">Countries</Link>
        <span className="crumb sep">/</span>
        <Link to={`/${country.code}`} className="crumb">{country.name}</Link>
        <span className="crumb sep">/</span>
        <span className="crumb">{party.name}</span>
      </nav>

      <h2 className="sectionTitle">{party.name} — Questionnaire</h2>
      <QuestionnaireForm party={party} />
    </main>
  );
}

/* --- Your preferred questionnaire style: compact, clean, step-by-step, sliders for intensity,
   Likert for stance, crisp income brackets, and a priorities picker. --- */
import QuestionnaireForm from "./components/QuestionnaireForm";

export default function App() {
  return (
    <div className="appRoot">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Countries />} />
          <Route path="/:countryCode" element={<Parties />} />
          <Route path="/:countryCode/:partyId" element={<Questionnaire />} />
          <Route path="*" element={<main className="container"><div className="empty">404</div></main>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
