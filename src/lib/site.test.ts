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
        ? `| ${siteResume.basics.label.trim()}`
        : undefined,
      siteResume.basics.location.city.trim()
        ? `in ${siteResume.basics.location.city.trim()}`
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
    const graph = sharedSeoMetadata.structuredData["@graph"];
    const profilePage = graph.find((node) => node["@type"] === "ProfilePage");
    const person = graph.find((node) => node["@type"] === "Person");

    expect(profilePage?.url).toBe(
      sharedSeoMetadata.canonicalUrl,
    );
    expect(person?.url).toBe(
      sharedSeoMetadata.canonicalUrl,
    );
    expect(person?.sameAs).toEqual(
      expectedSameAs,
    );
    expect(profilePage?.["@id"]).toBe(
      `${sharedSeoMetadata.canonicalUrl}#profile`,
    );
    expect(person?.["@id"]).toBe(
      `${sharedSeoMetadata.canonicalUrl}#person`,
    );
  });

  it("describes the public route as a ProfilePage with truthful Person evidence", () => {
    const graph = sharedSeoMetadata.structuredData["@graph"];
    const profilePage = graph.find((node) => node["@type"] === "ProfilePage");
    const person = graph.find((node) => node["@type"] === "Person");

    expect(profilePage?.mainEntity).toEqual({
      "@id": `${sharedSeoMetadata.canonicalUrl}#person`,
    });
    expect(person?.jobTitle).toBe("Senior AI/ML Engineer");
    expect(person?.homeLocation).toEqual({
      "@type": "Place",
      name: "New York City, New York, US",
    });
    expect(person?.image).toBe(sharedSeoMetadata.imageUrl);
    expect(person?.knowsAbout).toContain("AI, LLM & Agent Engineering");
    expect(person?.alumniOf).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "University of California, Berkeley - College of Engineering",
        }),
      ]),
    );
    expect(person?.hasCredential).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "AWS Certified Cloud Practitioner" }),
      ]),
    );
    expect(person?.subjectOf).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "SoftwareSourceCode",
          name: "AI Agent Harness Configs",
          codeRepository: "https://github.com/wyattowalsh/agents",
        }),
        expect.objectContaining({
          "@type": "Article",
          headline: "Basics of Linear Regression Modeling and Ordinary Least Squares (OLS)",
        }),
      ]),
    );
  });

  it("keeps SEO copy concise and keyword-rich", () => {
    expect(sharedSeoMetadata.description.length).toBeLessThanOrEqual(160);
    expect(sharedSeoMetadata.keywords).toContain("OpenAI API");
    expect(sharedSeoMetadata.keywords).toContain("Retrieval Augmented Generation (RAG)");
  });
});
