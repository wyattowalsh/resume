import skillIcons from "@assets/data/skill-icons.json";
import skillDetailsData from "@assets/data/skill-details.json";
import resumeData from "@assets/data/resume.json";
import skillSectionIcons from "@assets/data/skill-section-icons.json";
import siteVariant from "@assets/data/variants/site.json";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getSkillDetail, getSkillDetails } from "./skill-details";

const blockedUserFacingFragments = [
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
	"\\brelevant to\\b",
	"\\bsignals\\b",
	"\\bsupports\\b",
	"\\bconnects\\b",
	"\\bno dedicated implementation\\b",
	"\\bproject-specific\\b",
	"\\bdoes not name\\b",
	"\\bnot named\\b",
	"\\bvisible .* skill group\\b",
	"\\bbroader language toolkit\\b",
] as const;

const blockedUserFacingPattern = new RegExp(
	blockedUserFacingFragments.join("|"),
	"i",
);

const genericContextTemplatePattern = new RegExp(
	[
		"is framed with AI systems work spanning model integration",
		"appears with coding-assistant surfaces",
		"sits in the modeling toolkit around feature work",
		"is positioned with data-platform work across pipelines",
		"belongs to the real-time systems cluster",
		"is part of the backend systems cluster",
		"sits with interface tools for React apps",
		"belongs to the delivery and operations stack",
		"appears with quality and architecture practices",
		"is part of the implementation and authoring set",
	].join("|"),
	"i",
);

const repeatedSmallWordPattern = /\b(a|an|and|for|in|of|the|to|with) \1\b/i;

const firstPartyOnlyUsagePattern =
	/\b(Wyatt|used|built|implemented|deployed|shipped|delivered|production|public-site|publishing path|integration)\b/i;

const firstPartyOnlyContextPattern = new RegExp(
	[
		"^Within .+, .+ refers to .+[.!?]$",
		"^Here, .+ marks .+[.!?]$",
		"^For readers, .+ names .+[.!?]$",
		"^This popup frames .+ around .+[.!?]$",
		"^The .+ grouping treats .+ as .+[.!?]$",
		"^.+ appears here as .+[.!?]$",
		"^In this skill group, .+ describes .+[.!?]$",
		"^For this popover, .+ means .+[.!?]$",
		"^The .+ context uses .+ to describe .+[.!?]$",
		"^Readers can read .+ here as .+[.!?]$",
		"^.+ serves as shorthand for .+[.!?]$",
		"^Inside .+, .+ identifies .+[.!?]$",
	].join("|"),
);

const contextFramePatterns = [
	[/^Within .+, .+ refers to /, "Within-frame"],
	[/^Here, .+ marks /, "Here-frame"],
	[/^For readers, .+ names /, "Readers-frame"],
	[/^This popup frames .+ around /, "Popup-frame"],
	[/^The .+ grouping treats .+ as /, "Grouping-frame"],
	[/^.+ appears here as /, "Appears-frame"],
	[/^In this skill group, .+ describes /, "Skill-group-frame"],
	[/^For this popover, .+ means /, "Popover-frame"],
	[/^The .+ context uses .+ to describe /, "Context-frame"],
	[/^Readers can read .+ here as /, "Read-frame"],
	[/^.+ serves as shorthand for /, "Shorthand-frame"],
	[/^Inside .+, .+ identifies /, "Inside-frame"],
] as const;

const contextFrame = (copy: string) =>
	contextFramePatterns.find(([pattern]) => pattern.test(copy))?.[1] ??
	"Unknown-frame";

const overlapStopWords = new Set([
	"a",
	"an",
	"and",
	"are",
	"as",
	"at",
	"be",
	"by",
	"for",
	"from",
	"in",
	"into",
	"is",
	"it",
	"its",
	"of",
	"on",
	"or",
	"part",
	"public",
	"resume",
	"skill",
	"skills",
	"the",
	"to",
	"visible",
	"with",
	"work",
	"works",
	"wyatt",
]);

const meaningfulWords = (copy: string) =>
	copy
		.toLowerCase()
		.replace(/[^a-z0-9+#.\s-]/g, " ")
		.split(/\s+/)
		.filter((word) => word && !overlapStopWords.has(word));

const copyOverlapRatio = (left: string, right: string) => {
	const leftWords = new Set(meaningfulWords(left));
	const rightWords = new Set(meaningfulWords(right));
	const unionWords = new Set([...leftWords, ...rightWords]);

	if (unionWords.size === 0) return 0;

	let sharedWords = 0;

	for (const word of leftWords) {
		if (rightWords.has(word)) sharedWords += 1;
	}

	return sharedWords / unionWords.size;
};

const visibleSkillGroups = siteVariant.skills;
const visibleSkills = visibleSkillGroups.flatMap((group) => group.keywords);
const visibleSkillCategories = new Map(
	visibleSkillGroups.flatMap((group) =>
		group.keywords.map((skillName) => [skillName, group.name] as const),
	),
);
const firstPartyLabels = new Set(visibleSkillGroups.map((group) => group.name));
const evidenceLabelsByKind = {
	work: new Set(resumeData.work.map((entry) => entry.name)),
	project: new Set(resumeData.projects.map((entry) => entry.name)),
	credential: new Set(resumeData.certificates.map((entry) => entry.name)),
	publication: new Set(resumeData.publications.map((entry) => entry.name)),
	"first-party": firstPartyLabels,
};
const sectionIconNames = new Set([
	"bot",
	"brain-circuit",
	"chart-line",
	"cloud",
	"code-xml",
	"database",
	"languages",
	"monitor",
	"radio-tower",
	"server",
	"shield-check",
]);

describe("skill details", () => {
	it("keeps curated interactive skills scoped to visible site skills", () => {
		const visibleSkillSet = new Set(visibleSkills);

		for (const skillName of Object.keys(getSkillDetails())) {
			expect(visibleSkillSet).toContain(skillName);
		}
	});

	it("keeps curated categories and evidence aligned with resume data", () => {
		for (const [skillName, detail] of Object.entries(getSkillDetails())) {
			expect(detail.category, skillName).toBe(
				visibleSkillCategories.get(skillName),
			);

			for (const evidence of detail.evidence) {
				expect(
					evidenceLabelsByKind[evidence.kind],
					`${skillName}: ${evidence.label}`,
				).toContain(evidence.label);
			}
		}
	});

	it("keeps curated popover copy compact and evidence-backed", () => {
		for (const [skillName, detail] of Object.entries(getSkillDetails())) {
			expect(detail.summary).not.toMatch(/part of this resume/i);
			expect(detail.summary).not.toContain(detail.category);
			expect(detail.summary.length).toBeGreaterThanOrEqual(45);
			expect(detail.summary.length).toBeLessThanOrEqual(140);
			expect(detail.resumeContext.length).toBeGreaterThanOrEqual(45);
			expect(detail.resumeContext.length).toBeLessThanOrEqual(170);
			expect(detail.evidence.length).toBeGreaterThanOrEqual(1);
			expect(detail.links.length).toBeGreaterThanOrEqual(1);
			expect(detail.verification.lastCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(detail.summary).not.toMatch(blockedUserFacingPattern);
			expect(detail.resumeContext).not.toMatch(blockedUserFacingPattern);
			expect(detail.summary, skillName).not.toMatch(repeatedSmallWordPattern);
			expect(detail.resumeContext, skillName).not.toMatch(
				repeatedSmallWordPattern,
			);

			const resolved = getSkillDetail(skillName, detail.category);

			expect(resolved?.icon?.path).toMatch(/^\/skill-icons\//);
		}
	});

	it("keeps curated popover copy specific and non-repetitive", () => {
		const resumeContextOwners = new Map<string, string>();
		const firstPartyFrameCounts = new Map<string, number>();

		for (const [skillName, detail] of Object.entries(getSkillDetails())) {
			const isFirstPartyOnly =
				detail.evidence.length === 1 &&
				detail.evidence[0]?.kind === "first-party";

			expect(detail.resumeContext, skillName).not.toMatch(
				genericContextTemplatePattern,
			);

			if (isFirstPartyOnly) {
				expect(detail.resumeContext, skillName).toMatch(
					firstPartyOnlyContextPattern,
				);
				expect(detail.resumeContext, skillName).not.toMatch(
					firstPartyOnlyUsagePattern,
				);

				const frame = contextFrame(detail.resumeContext);

				firstPartyFrameCounts.set(
					frame,
					(firstPartyFrameCounts.get(frame) ?? 0) + 1,
				);
			}

			expect(
				copyOverlapRatio(detail.summary, detail.resumeContext),
				skillName,
			).toBeLessThan(0.52);

			const existingOwner = resumeContextOwners.get(detail.resumeContext);

			expect(
				existingOwner,
				`${skillName} duplicates resumeContext from ${existingOwner}`,
			).toBeUndefined();

			resumeContextOwners.set(detail.resumeContext, skillName);
		}

		for (const [frame, count] of firstPartyFrameCounts) {
			expect(count, frame).toBeLessThanOrEqual(12);
		}
	});

	it("uses neutral source evidence without relative-quality fields", () => {
		const serializedDetails = JSON.stringify(skillDetailsData);

		expect(serializedDetails).not.toMatch(blockedUserFacingPattern);

		for (const detail of Object.values(getSkillDetails())) {
			expect(detail).toHaveProperty("resumeContext");
			expect(detail).not.toHaveProperty("resume" + "Relevance");

			for (const evidence of detail.evidence) {
				expect(Object.keys(evidence).sort()).toEqual(["kind", "label"]);
			}
		}
	});

	it("resolves aligned popover detail for every visible skill", () => {
		for (const group of visibleSkillGroups) {
			for (const skillName of group.keywords) {
				const detail = getSkillDetail(skillName, group.name);

				expect(detail, skillName).toBeDefined();
				expect(detail?.category, skillName).toBe(group.name);
				expect(detail?.summary.length, skillName).toBeGreaterThanOrEqual(45);
				expect(detail?.resumeContext.length, skillName).toBeGreaterThanOrEqual(
					45,
				);
				expect(detail?.evidence.length, skillName).toBeGreaterThanOrEqual(1);
				expect(detail?.links.length, skillName).toBeGreaterThanOrEqual(1);
				expect(detail?.icon?.path, skillName).toMatch(/^\/skill-icons\//);
			}
		}
	});

	it("preserves curated references for known high-signal skills", () => {
		expect(getSkillDetail("AMPS", "Streaming")).toMatchObject({
			links: [{ href: "https://crankuptheamps.com/" }],
		});
		expect(getSkillDetail("C++", "Languages & Authoring")).toMatchObject({
			category: "Languages & Authoring",
			links: [{ href: "https://isocpp.org/" }],
		});
		expect(
			getSkillDetail("Deliberately Missing Skill", "Other"),
		).toBeUndefined();
	});

	it("uses transparent synthetic copy and useful reference links", () => {
		const curatedSkillNames = new Set(Object.keys(getSkillDetails()));

		for (const group of visibleSkillGroups) {
			for (const skillName of group.keywords) {
				if (curatedSkillNames.has(skillName)) continue;

				const detail = getSkillDetail(skillName, group.name);

				expect(detail?.summary, skillName).toBe(
					`${skillName} is listed under ${group.name} on the public resume.`,
				);
				expect(detail?.resumeContext, skillName).toMatch(
					/^This category covers|^This popup has/,
				);
				expect(detail?.resumeContext, skillName).not.toMatch(
					blockedUserFacingPattern,
				);
				expect(detail?.evidence, skillName).toEqual([
					{ label: group.name, kind: "first-party" },
				]);

				for (const link of detail?.links ?? []) {
					expect(link.href, skillName).not.toMatch(
						/^https:\/\/w4w\.dev\/resume#/,
					);
					expect(link.href, skillName).not.toMatch(
						/^https:\/\/www\.w4w\.dev\/resume#/,
					);
					expect(link.label, skillName).not.toBe("Reference");
				}
			}
		}
	});

	it("preserves evidence-sensitive curated entries", () => {
		expect(
			getSkillDetail("Amazon Bedrock", "AI, LLM & Agent Engineering"),
		).toMatchObject({
			resumeContext:
				"Wyatt used Amazon Bedrock AgentCore in Frame Payments LLM document-intelligence work.",
			evidence: [{ label: "Frame Payments", kind: "work" }],
		});
		expect(
			getSkillDetail("Docker", "Cloud, DevOps & Observability"),
		).toMatchObject({
			evidence: [{ label: "MCP-Crawl4AI", kind: "project" }],
		});
		expect(
			getSkillDetail("FastAPI", "Backend, APIs & Distributed Systems"),
		).toMatchObject({
			evidence: [
				{ label: "Backend, APIs & Distributed Systems", kind: "first-party" },
			],
		});
		expect(
			getSkillDetail("Vercel AI SDK", "AI, LLM & Agent Engineering"),
		).toMatchObject({
			evidence: [{ label: "MDXPad", kind: "project" }],
			links: [{ href: "https://ai-sdk.dev/docs/introduction" }],
		});
		expect(getSkillDetail("SPARQL", "Languages & Authoring")).toMatchObject({
			evidence: [{ label: "Languages & Authoring", kind: "first-party" }],
		});
	});

	it("uses non-generic web-sourced skill icons", () => {
		for (const entry of Object.values(skillIcons)) {
			expect(entry.source).not.toBe("font-awesome");
			expect(entry.source).not.toBe("simple-icons");
		}

		expect(skillIcons.Python.source).toBe("official");
		expect(skillIcons.Python.sourceUrl).toContain("python.org");
		expect(skillIcons.React.sourceUrl).toContain("react-original.svg");
		expect(skillIcons.AWS.sourceUrl).toMatch(/^https:\/\//);
	});

	it("keeps every visible site skill covered by the icon manifest", () => {
		for (const skillName of visibleSkills) {
			expect(skillIcons).toHaveProperty(skillName);
			expect(skillIcons[skillName as keyof typeof skillIcons].iconPath).toMatch(
				/^\/skill-icons\//,
			);
		}
	});

	it("keeps visible skill icon files and hashes in sync", () => {
		for (const skillName of visibleSkills) {
			const icon = skillIcons[skillName as keyof typeof skillIcons];
			const iconPath = join(
				process.cwd(),
				"public",
				icon.iconPath.replace(/^\//, ""),
			);

			expect(existsSync(iconPath), `${skillName}: ${icon.iconPath}`).toBe(true);

			const sha256 = createHash("sha256")
				.update(readFileSync(iconPath))
				.digest("hex");

			expect(sha256, skillName).toBe(icon.sha256);
		}
	});

	it("keeps section icon manifest aligned with visible skill sections", () => {
		expect(Object.keys(skillSectionIcons).sort()).toEqual(
			visibleSkillGroups.map((group) => group.name).sort(),
		);

		for (const [sectionName, iconName] of Object.entries(skillSectionIcons)) {
			expect(sectionIconNames, sectionName).toContain(iconName);
		}
	});
});
