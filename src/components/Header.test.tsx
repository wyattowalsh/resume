import { getResumeVariant } from "@/lib/resume-data";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("keeps the hero focused on contact links without duplicate downloads", () => {
    const { basics } = getResumeVariant("site");
    const markup = renderToStaticMarkup(<Header basics={basics} />);

    expect(markup).not.toContain("Quick downloads");
    expect(markup).not.toContain("/downloads/");
    expect(markup).toContain(`mailto:${basics.email}`);
    expect(markup).toContain("GitHub");
  });
});
