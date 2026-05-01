/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("PopoverContent", () => {
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

  it("keeps portaled content out of print and exposes dialog labels", () => {
    act(() => {
      root.render(
        <Popover open>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent
            aria-labelledby="popover-title"
            aria-describedby="popover-description"
          >
            <h2 id="popover-title">Evidence</h2>
            <p id="popover-description">Proof points</p>
          </PopoverContent>
        </Popover>,
      );
    });

    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]');

    expect(dialog).not.toBeNull();
    expect(dialog?.className).toContain("print:hidden");
    expect(dialog?.getAttribute("aria-labelledby")).toBe("popover-title");
    expect(dialog?.getAttribute("aria-describedby")).toBe("popover-description");
  });
});
