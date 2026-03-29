import resumeData from "@assets/data/resume.json";
import { resumeSchema } from "@/lib/schema";

const siteUrl = "https://resume.w4w.dev";
const siteImagePath = "/android-chrome-512x512.png";

const resume = resumeSchema.parse(resumeData);
const primaryWork = resume.work[0];
const locationName = [
  resume.basics.location.city,
  resume.basics.location.region,
  resume.basics.location.countryCode,
]
  .filter(Boolean)
  .join(", ");

function buildDescription() {
  if (resume.basics.summary?.trim()) {
    return resume.basics.summary.trim();
  }

  if (primaryWork) {
    return `${resume.basics.name} is a ${primaryWork.position} at ${primaryWork.name}. Explore experience, skills, education, projects, and publications.`;
  }

  return `Explore ${resume.basics.name}'s experience, skills, education, projects, and publications.`;
}

const description = buildDescription();
const title = `${resume.basics.name} | Resume`;
const canonicalUrl = `${siteUrl}/`;
const imageUrl = `${siteUrl}${siteImagePath}`;

export const sharedSeoMetadata = {
  title,
  description,
  siteUrl,
  canonicalUrl,
  imageUrl,
  imageAlt: `${resume.basics.name} resume site icon`,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: title,
    description,
    url: canonicalUrl,
    mainEntity: {
      "@type": "Person",
      name: resume.basics.name,
      url: resume.basics.url,
      sameAs: resume.basics.profiles.map((profile) => profile.url),
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
