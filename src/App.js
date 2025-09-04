import React from "react";
import { BrowserRouter, Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import "./countryPortals.css";
import { loadManifestos, validateManifestos } from "./lib/load";
import QuestionnaireForm from "./components/QuestionnaireForm";
import ResultCard from "./components/ResultCard";
import { computeImpact } from "./lib/impact";
import { DOMAINS } from "./config/assumptions";

// ---------- Error Boundary ----------
class ErrorBoundary extends React.Component{
  constructor(p){ super(p); this.state={hasError:false,error:null}; }
  static getDerivedStateFromError(e){ return {hasError:true,error:e}; }
  componentDidCatch(e,info){ console.error("ErrorBoundary:", e, info); }
  render(){
    if(this.state.hasError){
      return <div style={{padding:16,fontFamily:"monospace"}}>
        <h2>Something crashed</h2><pre>{String(this.state.error)}</pre>
      </div>;
    }
    return this.props.children;
  }
}

// ---------- Layout ----------
function Header(){
  return (
    <header className="shell">
      <div className="hero">
        <div>
          <h1 className="grad">Manifesto AI</h1>
          <p className="sub">Choose a country, select a party, answer your questionnaire, and get an AI impact analysis tailored to you.</p>
        </div>
      </div>
    </header>
  );
}

// ---------- Screens ----------
function Countries(){
  const data=loadManifestos();
  const nav=useNavigate();
  if(!validateManifestos()) return <main className="container"><div className="empty">Data schema invalid.</div></main>;
  return (
    <main className="container">
      <div className="grid">
        {(data.countries||[]).map(c=>(
          <button key={c.code} className="card clickable" onClick={()=>nav(`/${c.code}`)}>
            <div className="flag">{c.flag || "🌍"}</div>
            <div className="title">{c.name}</div>
            <div className="hint">View parties →</div>
          </button>
        ))}
      </div>
    </main>
  );
}

function Parties(){
  const {countryCode}=useParams();
  const data=loadManifestos();
  const country=(data.countries||[]).find(c=>c.code===countryCode);
  if(!country) return <main className="container"><div className="empty">Unknown country.</div></main>;
  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/" className="crumb">Countries</Link><span className="crumb sep">/</span>
        <span className="crumb">{country.name}</span>
      </nav>
      <h2 className="sectionTitle">Parties in {country.name}</h2>
      <div className="grid">
        {(country.parties||[]).map(p=>(
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

function Questionnaire(){
  const {countryCode,partyId}=useParams();
  const data=loadManifestos();
  const country=(data.countries||[]).find(c=>c.code===countryCode);
  const party=country?.parties?.find(p=>p.id===partyId);
  if(!country||!party) return <main className="container"><div className="empty">Not found.</div></main>;
  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/" className="crumb">Countries</Link><span className="crumb sep">/</span>
        <Link to={`/${country.code}`} className="crumb">{country.name}</Link><span className="crumb sep">/</span>
        <span className="crumb">{party.name}</span>
      </nav>
      <h2 className="sectionTitle">{party.name} — Questionnaire</h2>
      <QuestionnaireForm party={party} />
    </main>
  );
}

function Result(){
  const {countryCode,partyId}=useParams();
  const data=loadManifestos();
  const country=(data.countries||[]).find(c=>c.code===countryCode);
  const party=country?.parties?.find(p=>p.id===partyId);
  const raw=localStorage.getItem("manifestoAI:profile");
  const profile=raw?JSON.parse(raw):null;

  if(!country||!party) return <main className="container"><div className="empty">Not found.</div></main>;
  if(!profile) return <main className="container"><div className="empty">No questionnaire data found. Please fill it first.</div></main>;

  const { breakdown, narrative } = computeImpact(profile, party);

  return (
    <main className="container">
      <nav className="crumbs">
        <Link to="/" className="crumb">Countries</Link><span className="crumb sep">/</span>
        <Link to={`/${country.code}`} className="crumb">{country.name}</Link><span className="crumb sep">/</span>
        <Link to={`/${country.code}/${party.id}`} className="crumb">{party.name}</Link><span className="crumb sep">/</span>
        <span className="crumb">Result</span>
      </nav>

      <h2 className="sectionTitle">Personalized Impact — {party.name}</h2>

      <div className="panel">
        <p className="muted">{narrative}</p>
        <div className="kpis">
          {DOMAINS.filter(d=>d!=="Overall").map(d=>(
            <ResultCard key={d} title={d} score={breakdown[d]} />
          ))}
          <ResultCard title="Overall" score={breakdown["Overall"]} />
        </div>
      </div>
    </main>
  );
}

// ---------- App ----------
export default function App(){
  return (
    <div className="appRoot">
      <ErrorBoundary>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Countries/>}/>
            <Route path="/:countryCode" element={<Parties/>}/>
            <Route path="/:countryCode/:partyId" element={<Questionnaire/>}/>
            <Route path="/:countryCode/:partyId/result" element={<Result/>}/>
            <Route path="*" element={<main className="container"><div className="empty">404</div></main>}/>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}
