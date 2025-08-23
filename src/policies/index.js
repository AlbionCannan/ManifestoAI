// Import policy modules (we're reusing your existing /pages/* files as data modules)
import FRANCE from "../pages/France";
import GERMANY from "../pages/Germany";
import ITALY from "../pages/Italy";
import POLAND from "../pages/Poland";
import SPAIN from "../pages/Spain";

export const COUNTRY_POLICIES = {
  France: FRANCE,
  Germany: GERMANY,
  Italy: ITALY,
  Poland: POLAND,
  Spain: SPAIN,
};

export const COUNTRY_LIST = Object.keys(COUNTRY_POLICIES);

export const getPolicies = (country, candidate) =>
  COUNTRY_POLICIES[country]?.[candidate] || [];
