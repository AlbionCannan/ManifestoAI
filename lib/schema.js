export function isString(x){ return typeof x === "string"; }
export function isNumber(x){ return typeof x === "number" && !Number.isNaN(x); }
export function isArray(x){ return Array.isArray(x); }
export function optional(x, fn){ return x === undefined || fn(x); }

export function validatePolicy(p){
  const errors = [];
  if (!isString(p.id)) errors.push("id");
  if (!isString(p.title)) errors.push("title");
  if (!isString(p.description)) errors.push("description");
  if (!isString(p.source_url)) errors.push("source_url");
  if (!optional(p.effective_date, isString)) errors.push("effective_date");
  if (typeof p.eligibility !== "object") errors.push("eligibility");
  if (typeof p.compute !== "object") errors.push("compute");
  if (!p.compute || !isString(p.compute.type)) errors.push("compute.type");
  if (!p.compute || typeof p.compute.params !== "object") errors.push("compute.params");
  return errors;
}

export function validateManifest(doc){
  const errs = [];
  if (!isString(doc.country)) errs.push("country");
  if (!isString(doc.candidate)) errs.push("candidate");
  if (!optional(doc.source_manifesto_url, isString)) errs.push("source_manifesto_url");
  if (!optional(doc.retrieved_at, isString)) errs.push("retrieved_at");
  if (!isArray(doc.policies)) errs.push("policies");
  return errs;
}
