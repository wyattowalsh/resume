import { getResumeVariant } from "@/lib/resume-data";
import { rootTitle } from "@/lib/site";

const siteUrl = "https://resume.w4w.dev";
const siteImagePath = "/android-chrome-512x512.png";

const siteResume = getResumeVariant("site");
const primaryWork = siteResume.work[0];
const locationName = [
  siteResume.basics.location.city,
  siteResume.basics.location.region,
  siteResume.basics.location.countryCode,
]
  .filter(Boolean)
  .join(", ");

function buildDescription() {
  if (siteResume.seo?.description?.trim()) {
    return siteResume.seo.description.trim();
  }

  if (siteResume.basics.summary?.trim()) {
    return siteResume.basics.summary.trim();
  }

  if (primaryWork) {
    return `${siteResume.basics.name} is a ${primaryWork.position} at ${primaryWork.name}. Explore experience, skills, education, projects, and publications.`;
  }

  return `Explore ${siteResume.basics.name}'s experience, skills, education, projects, and publications.`;
}

const description = buildDescription();
const canonicalUrl = `${siteUrl}/`;
const imageUrl = `${siteUrl}${siteImagePath}`;

export const sharedSeoMetadata = {
  title: rootTitle,
  description,
  siteUrl,
  canonicalUrl,
  imageUrl,
  imageAlt: `${siteResume.basics.name} resume site icon`,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: rootTitle,
    description,
    url: canonicalUrl,
    mainEntity: {
      "@type": "Person",
      name: siteResume.basics.name,
      url: siteResume.basics.url,
      sameAs: siteResume.basics.profiles.map((profile) => profile.url),
      ...(locationName
        ? {
            homeLocation: {
              "@type": "Place",
              name: locationName,
            },
          }
        : {}),
      ...(primaryWork
        ? {
            jobTitle: primaryWork.position,
            worksFor: {
              "@type": "Organization",
              name: primaryWork.name,
              ...(primaryWork.url ? { url: primaryWork.url } : {}),
            },
          }
        : {}),
    },
  },
} as const;
