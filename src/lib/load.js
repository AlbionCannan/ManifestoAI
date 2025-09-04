import raw from "../data/manifestos.json";
import { checkSchema } from "./schema";

export function loadManifestos() {
  return raw;
}

export function validateManifestos() {
  try {
    return checkSchema(raw);
  } catch {
    return false;
  }
}
