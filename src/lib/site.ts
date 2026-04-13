// Server-only: builds metadata from local resume JSON files during SSR/head rendering.
import { readFileSync } from "node:fs";

type TitleBasics = {
  name: string;
  label?: string;
  location: {
    city: string;
  };
};

type ResumeTitleData = {
  basics: TitleBasics;
};

type SiteTitleVariantData = {
  basics?: {
    label?: string | null;
  };
};

const resumeData = JSON.parse(
  readFileSync(new URL("../../assets/data/resume.json", import.meta.url), "utf8"),
) as ResumeTitleData;
const siteVariantData = JSON.parse(
  readFileSync(
    new URL("../../assets/data/variants/site.json", import.meta.url),
    "utf8",
  ),
) as SiteTitleVariantData;

const resolvedLabel =
  siteVariantData.basics?.label === undefined
    ? resumeData.basics.label
    : siteVariantData.basics.label ?? undefined;
const labelSuffix = resolvedLabel?.trim()
  ? ` — ${resolvedLabel.trim()}`
  : "";
const locationSuffix = resumeData.basics.location.city.trim()
  ? ` · ${resumeData.basics.location.city.trim()}`
  : "";

export const rootTitle = `${resumeData.basics.name}${labelSuffix}${locationSuffix}`;
