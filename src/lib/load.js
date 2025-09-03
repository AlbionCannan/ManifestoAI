import RAW from "../data/manifestos.json";               // from lib -> data
import { validateManifest, validatePolicy } from "./schema";

const _byCountry = new Map(); // country -> Map(candidate -> manifest)

function addManifest(doc){
  const { country, candidate } = doc || {};
  if (!country || !candidate) return;
  if (!_byCountry.has(country)) _byCountry.set(country, new Map());
  _byCountry.get(country).set(candidate, doc);
}

// Validate & index everything
if (!RAW || !Array.isArray(RAW.manifests)) {
  console.warn("[Manifest load] manifestos.json missing or malformed.");
} else {
  RAW.manifests.forEach(doc => {
    const mErrs = validateManifest(doc);
    if (mErrs.length) {
      console.warn(`[Manifest warning] ${doc.country || "NO_COUNTRY"} / ${doc.candidate || "NO_CANDIDATE"}:`, mErrs);
    }
    (doc.policies || []).forEach(p => {
      const pErrs = validatePolicy(p);
      if (pErrs.length) {
        console.warn(`[Policy warning] ${doc.country}/${doc.candidate}/${p.id || "NO_ID"}:`, pErrs);
      }
    });
    addManifest(doc);
  });
}

export const COUNTRIES = Array.from(_byCountry.keys());

export function getCandidates(country){
  const m = _byCountry.get(country);
  return m ? Array.from(m.keys()) : [];
}

export function getManifest(country, candidate){
  const m = _byCountry.get(country);
  return m ? (m.get(candidate) || null) : null;
}
