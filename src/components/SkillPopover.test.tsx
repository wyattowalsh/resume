/** @vitest-environment jsdom */

import { getSkillDetail } from "@/lib/skill-details";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SkillPopover } from "./SkillPopover";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const blockedRenderedFragments = [
  "\\bconfiden" + "ce\\b",
  "\\bdir" + "ect\\b",
  "\\binfer" + "red\\b",
  "\\badj" + "acent\\b",
  "\\bresume sig" + "nal\\b",
  "\\bprofici" + "ency\\b",
  "\\brat" + "ing\\b",
  "\\bexp" + "ert\\b",
  "\\bbegin" + "ner\\b",
  "\\bstrong sig" + "nal\\b",
  "\\bweak sig" + "nal\\b",
] as const;

const blockedRenderedPattern = new RegExp(
  blockedRenderedFragments.join("|"),
  "i",
);

describe("SkillPopover", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("opens on activation, not focus", () => {
    const detail = getSkillDetail("AMPS", "Streaming, Messaging & Capital Markets Systems");

    expect(detail).toBeDefined();

    act(() => {
      root.render(
        <SkillPopover
          category="Streaming, Messaging & Capital Markets Systems"
          detail={detail!}
          skillName="AMPS"
        >
          AMPS
        </SkillPopover>,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>("button");

    expect(trigger).not.toBeNull();

    act(() => trigger!.focus());
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    act(() => trigger!.click());
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  });

  it("provides an explicit close control", () => {
    const detail = getSkillDetail("AMPS", "Streaming, Messaging & Capital Markets Systems");

    act(() => {
      root.render(
        <SkillPopover
          category="Streaming, Messaging & Capital Markets Systems"
          detail={detail!}
          skillName="AMPS"
        >
          AMPS
        </SkillPopover>,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>("button");

    act(() => trigger!.click());

    const closeButton = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Close AMPS details"]',
    );

    expect(closeButton).not.toBeNull();

    act(() => closeButton!.click());
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
  });

  it("renders a distilled context card without quality or ranking language", () => {
    const detail = getSkillDetail("AMPS", "Streaming, Messaging & Capital Markets Systems");

    act(() => {
      root.render(
        <SkillPopover
          category="Streaming, Messaging & Capital Markets Systems"
          detail={detail!}
          skillName="AMPS"
        >
          AMPS
        </SkillPopover>,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>("button");

    act(() => trigger!.click());

    const dialog = document.body.querySelector('[role="dialog"]');

    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain("60East's high-performance");
    expect(dialog?.textContent).toContain("Wyatt used AMPS");
    expect(dialog?.textContent).toContain("JPMorgan Chase & Co.");
    expect(dialog?.textContent).toContain("Product site");
    expect(dialog?.textContent).not.toContain("Professional use");
    expect(dialog?.textContent).not.toContain("Resume context");
    expect(dialog?.textContent).not.toContain("Evidence");
    expect(dialog?.textContent).not.toContain("References");
    expect(dialog?.textContent).not.toMatch(blockedRenderedPattern);
  });
});
