import { getResumeVariant } from "@/lib/resume-data";
import { rootTitle } from "@/lib/site";

const siteUrl = "https://resume.w4w.dev";
const fallbackSiteImagePath = "/android-chrome-512x512.png";

function toAbsoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, siteUrl).toString();
}

const siteResume = getResumeVariant("site");
const primaryWork = siteResume.work[0];
const siteName = `${siteResume.basics.name} Resume`;
const profileImagePath = siteResume.basics.image?.trim() || undefined;
const socialImagePath = profileImagePath ?? fallbackSiteImagePath;
const jobTitle = siteResume.basics.label?.trim() || primaryWork?.position;
const worksFor = primaryWork && !primaryWork.endDate
  ? {
      "@type": "Organization" as const,
      name: primaryWork.name,
      ...(primaryWork.url ? { url: primaryWork.url } : {}),
    }
  : undefined;
const locationName = [
  siteResume.basics.location.city,
  siteResume.basics.location.region,
  siteResume.basics.location.countryCode,
]
  .filter(Boolean)
  .join(", ");
const knowsAbout = Array.from(
  new Set(siteResume.skills?.flatMap((skill) => skill.keywords) ?? []),
);
const alumniOf = siteResume.education.map((education) => ({
  "@type": "EducationalOrganization",
  name: education.institution,
  ...(education.url ? { url: education.url } : {}),
}));
const credentials =
  siteResume.certificates?.map((certificate) => ({
    "@type": "EducationalOccupationalCredential",
    name: certificate.name,
    credentialCategory: "certificate",
    ...(certificate.url ? { url: certificate.url } : {}),
    recognizedBy: {
      "@type": "Organization",
      name: certificate.issuer,
    },
  })) ?? [];
const proofObjects = [
  ...(siteResume.projects?.map((project) => ({
    "@type": "SoftwareSourceCode" as const,
    name: project.name,
    description: project.description,
    url: project.url ?? project.githubUrl,
    codeRepository: project.githubUrl,
    dateCreated: project.startDate,
    ...(project.endDate ? { dateModified: project.endDate } : {}),
  })) ?? []),
  ...(siteResume.publications?.map((publication) => ({
    "@type": "Article" as const,
    headline: publication.name,
    url: publication.url,
    datePublished: publication.releaseDate,
    publisher: {
      "@type": "Organization" as const,
      name: publication.publisher,
    },
  })) ?? []),
];

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
const imageUrl = toAbsoluteUrl(socialImagePath);
const imageWidth = profileImagePath ? 1000 : 512;
const imageHeight = profileImagePath ? 1000 : 512;

export const sharedSeoMetadata = {
  title: rootTitle,
  description,
  siteUrl,
  canonicalUrl,
  imageUrl,
  imageAlt: profileImagePath
    ? `${siteResume.basics.name} profile image`
    : `${siteResume.basics.name} resume site icon`,
  imageWidth,
  imageHeight,
  siteName,
  locale: "en_US",
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
      ...(profileImagePath
        ? {
            image: toAbsoluteUrl(profileImagePath),
          }
        : {}),
      ...(jobTitle ? { jobTitle } : {}),
      ...(worksFor ? { worksFor } : {}),
      ...(knowsAbout.length ? { knowsAbout } : {}),
      ...(alumniOf.length ? { alumniOf } : {}),
      ...(credentials.length ? { hasCredential: credentials } : {}),
      ...(proofObjects.length ? { subjectOf: proofObjects } : {}),
    },
  },
} as const;
