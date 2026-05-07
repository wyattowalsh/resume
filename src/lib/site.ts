import { getResumeVariant } from "./resume-data";

const siteResume = getResumeVariant("site");

const labelSuffix = siteResume.basics.label?.trim()
  ? ` | ${siteResume.basics.label.trim()}`
  : "";
const locationSuffix = siteResume.basics.location.city.trim()
  ? ` in ${siteResume.basics.location.city.trim()}`
  : "";

export const rootTitle = `${siteResume.basics.name}${labelSuffix}${locationSuffix}`;
