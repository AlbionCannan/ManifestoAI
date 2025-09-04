export function checkSchema(data){
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.countries)) return false;
  for (const c of data.countries){
    if (!c.code || !c.name) return false;
    if (!Array.isArray(c.parties)) return false;
    for (const p of c.parties){
      if (!p.id || !p.name) return false;
      if (!p.policies || typeof p.policies !== "object") return false;
    }
  }
  return true;
}
