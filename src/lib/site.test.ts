import { describe, expect, it } from "vitest";
import { getResumeVariant } from "./resume-data";
import { sharedSeoMetadata } from "./seo";
import { rootTitle } from "./site";

describe("rootTitle", () => {
  it("derives the site title from resolved site resume data", () => {
    const siteResume = getResumeVariant("site");
    const expectedTitle = [
      siteResume.basics.name,
      siteResume.basics.label?.trim()
        ? `- ${siteResume.basics.label.trim()}`
        : undefined,
      siteResume.basics.location.city.trim()
        ? `· ${siteResume.basics.location.city.trim()}`
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    expect(rootTitle).toBe(expectedTitle);
  });
});

describe("sharedSeoMetadata", () => {
  it("uses the committed site headshot for social metadata", () => {
    const siteResume = getResumeVariant("site");

    expect(siteResume.basics.image).toBe("/wyatt-walsh-profile.png");
    expect(sharedSeoMetadata.imageUrl).toBe(
      "https://resume.w4w.dev/wyatt-walsh-profile.png",
    );
    expect(sharedSeoMetadata.imageAlt).toBe("Wyatt Walsh profile image");
    expect(sharedSeoMetadata.imageWidth).toBe(1000);
    expect(sharedSeoMetadata.imageHeight).toBe(1000);
  });

  it("keeps structured data URLs aligned with the canonical resume page", () => {
    const siteResume = getResumeVariant("site");
    const expectedSameAs = [
      siteResume.basics.url,
      ...siteResume.basics.profiles.map((profile) => profile.url),
    ];

    expect(sharedSeoMetadata.structuredData.url).toBe(
      sharedSeoMetadata.canonicalUrl,
    );
    expect(sharedSeoMetadata.structuredData.mainEntity.url).toBe(
      sharedSeoMetadata.canonicalUrl,
    );
    expect(sharedSeoMetadata.structuredData.mainEntity.sameAs).toEqual(
      expectedSameAs,
    );
  });
});
