/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionProgressNav, type SectionProgressItem } from "./SectionProgressNav";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ObserverCallback = IntersectionObserverCallback;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  callback: ObserverCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = () => [];
  unobserve = vi.fn();

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  emit(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver,
    );
  }
}

function appendSection(id: string) {
  const section = document.createElement("section");
  section.id = id;
  document.body.append(section);
  return section;
}

describe("SectionProgressNav", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("observes rendered sections and updates the visible progress value", () => {
    const workSection = appendSection("work-experience");
    const skillsSection = appendSection("skills");
    const sentinel = document.createElement("div");
    sentinel.setAttribute("data-scroll-progress-sentinel", "");
    document.body.append(sentinel);
    const items: SectionProgressItem[] = [
      { id: "work-experience", label: "Experience", kicker: "Evidence-first roles" },
      { id: "skills", label: "Skills", kicker: "ATS taxonomy" },
    ];

    act(() => root.render(<SectionProgressNav items={items} />));

    const observer = FakeIntersectionObserver.instances[0];
    const sentinelObserver = FakeIntersectionObserver.instances[1];
    expect(observer).toBeDefined();
    expect(sentinelObserver).toBeDefined();
    expect(observer.observe).toHaveBeenCalledWith(workSection);
    expect(observer.observe).toHaveBeenCalledWith(skillsSection);
    expect(sentinelObserver.observe).toHaveBeenCalledWith(sentinel);
    expect(container.querySelector("nav")?.className).toContain("opacity-0");
    expect(container.querySelector("a[href]")).toBeNull();

    act(() => {
      sentinelObserver.emit([
        {
          target: sentinel,
          isIntersecting: false,
          intersectionRatio: 0,
        },
      ]);
      observer.emit([
        {
          target: workSection,
          isIntersecting: true,
          intersectionRatio: 0.2,
        },
        {
          target: skillsSection,
          isIntersecting: true,
          intersectionRatio: 0.8,
        },
      ]);
    });

    expect(
      container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"),
    ).toBe("100");
    expect(
      container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuetext"),
    ).toBe("Skills section");
    expect(container.querySelector("nav")?.className).toContain("opacity-100");
    expect(
      container
        .querySelector<HTMLElement>('[data-slot="progress-indicator"]')
        ?.style.transform,
    ).toBe("translateX(-0%)");
  });
});
