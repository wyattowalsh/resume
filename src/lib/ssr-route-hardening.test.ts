import { describe, expect, it } from "vitest";
import {
  isBlockedProductionPath,
  normalizePath,
} from "../../api/ssr";

const productionEnv = {
  VERCEL: "1",
  VERCEL_ENV: "production",
};

describe("SSR print route hardening", () => {
  it.each([
    ["/full", "/full"],
    ["/full/", "/full"],
    ["/%66ull", "/full"],
    ["/single", "/single"],
    ["/%73ingle", "/single"],
  ])("normalizes %s to %s", (url, expected) => {
    expect(normalizePath(url)).toBe(expected);
  });

  it.each(["/full", "/full/", "/%66ull", "/single", "/%73ingle"])(
    "blocks %s on Vercel production",
    (url) => {
      expect(isBlockedProductionPath(url, productionEnv)).toBe(true);
    },
  );

  it("does not block outside Vercel production", () => {
    expect(
      isBlockedProductionPath("/full", {
        VERCEL: "1",
        VERCEL_ENV: "preview",
      }),
    ).toBe(false);
  });
});
