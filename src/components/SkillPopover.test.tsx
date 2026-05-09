/** @vitest-environment jsdom */

import { getSkillDetail } from "@/lib/skill-details";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SkillPopover } from "./SkillPopover";

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

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
	"\\badv" + "anced\\b",
	"\\bnov" + "ice\\b",
	"\\bmas" + "tery\\b",
	"\\bscore\\b",
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
		const detail = getSkillDetail(
			"AMPS",
			"Streaming, Messaging & Capital Markets Systems",
		);

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
		const detail = getSkillDetail(
			"AMPS",
			"Streaming, Messaging & Capital Markets Systems",
		);

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
		const detail = getSkillDetail(
			"AMPS",
			"Streaming, Messaging & Capital Markets Systems",
		);

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

	it("renders curated first-party details with safe external links", () => {
		const detail = getSkillDetail(
			"Google Gemini API",
			"AI, LLM & Agent Engineering",
		);

		act(() => {
			root.render(
				<SkillPopover
					category="AI, LLM & Agent Engineering"
					detail={detail!}
					skillName="Google Gemini API"
				>
					Google Gemini API
				</SkillPopover>,
			);
		});

		const trigger = container.querySelector<HTMLButtonElement>("button");

		act(() => trigger!.click());

		const dialog = document.body.querySelector('[role="dialog"]');
		const link = document.body.querySelector<HTMLAnchorElement>(
			'a[href="https://ai.google.dev/gemini-api/docs"]',
		);

		expect(dialog).not.toBeNull();
		expect(dialog?.getAttribute("aria-labelledby")).toBeTruthy();
		expect(dialog?.getAttribute("aria-describedby")).toBeTruthy();
		expect(dialog?.textContent).toContain(
			"Google API surface for building applications with Gemini models",
		);
		expect(dialog?.textContent).toContain(
			"Google Gemini API appears here as Gemini models for multimodal generation",
		);
		expect(dialog?.textContent).toContain("AI, LLM & Agent Engineering");
		expect(link).not.toBeNull();
		expect(link?.textContent).toContain("Gemini API docs");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(dialog?.textContent).not.toMatch(blockedRenderedPattern);
	});

	it("renders a safe fallback card when no detail resolves", () => {
		act(() => {
			root.render(
				<SkillPopover
					category="Other"
					detail={undefined}
					skillName="Deliberately Missing Skill"
				>
					Deliberately Missing Skill
				</SkillPopover>,
			);
		});

		const trigger = container.querySelector<HTMLButtonElement>("button");

		act(() => trigger!.click());

		const dialog = document.body.querySelector('[role="dialog"]');

		expect(dialog).not.toBeNull();
		expect(dialog?.textContent).toContain("Deliberately Missing Skill");
		expect(dialog?.textContent).toContain("Other");
		expect(dialog?.textContent).toContain(
			"toolkit across the roles and projects represented on this page",
		);
		expect(document.body.querySelector("a")).toBeNull();
	});

	it("falls back to text when an icon image fails", () => {
		const detail = getSkillDetail(
			"Google Gemini API",
			"AI, LLM & Agent Engineering",
		);

		act(() => {
			root.render(
				<SkillPopover
					category="AI, LLM & Agent Engineering"
					detail={detail!}
					skillName="Google Gemini API"
				>
					Google Gemini API
				</SkillPopover>,
			);
		});

		const img = container.querySelector<HTMLImageElement>("img");

		expect(img).not.toBeNull();

		act(() => img!.dispatchEvent(new Event("error", { bubbles: false })));

		expect(container.querySelector("img")).toBeNull();
		expect(container.textContent).toContain("G");
	});
});
