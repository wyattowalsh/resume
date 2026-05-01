import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import ts from "typescript";

const execFileAsync = promisify(execFile);
const OUTPUT_DIR = path.resolve(process.cwd(), "assets", "outputs");
const PUBLIC_DOWNLOADS_DIR = path.resolve(process.cwd(), "public", "downloads");
const RESUME_PATH = path.resolve(
  process.cwd(),
  "assets",
  "data",
  "resume.json",
);
const FULL_VARIANT_PATH = path.resolve(
  process.cwd(),
  "assets",
  "data",
  "variants",
  "full.json",
);
const SINGLE_VARIANT_PATH = path.resolve(
  process.cwd(),
  "assets",
  "data",
  "variants",
  "single.json",
);
const ARTIFACT_SPECS_PATH = path.resolve(
  process.cwd(),
  "src",
  "lib",
  "artifact-specs.ts",
);
const LETTER_WIDTH_POINTS = 612;
const LETTER_HEIGHT_POINTS = 792;
const LETTER_SIZE_TOLERANCE = 1;
const MAX_ARTIFACT_AGE_MS = 15 * 60 * 1_000;
const SHOULD_SKIP_ARTIFACT_RECENCY =
  process.env.RESUME_ARTIFACT_RECENCY === "skip";
const FULL_PAGE_ONE_LOWEST_TEXT_Y_MAX = 150;
const FULL_PAGE_TWO_LOWEST_TEXT_Y_MAX = 200;
const SINGLE_PAGE_LOWEST_TEXT_Y_MAX = 110;
const DEFAULT_LOWER_DENSITY_BAND_Y_MAX = 120;
const FULL_PAGE_ONE_LOWER_DENSITY_BAND_Y_MAX = 130;
const FULL_PAGE_TWO_LOWER_DENSITY_BAND_Y_MAX = 140;
const FULL_PAGE_ONE_LOWER_DENSITY_MIN_ROWS = 4;
const FULL_PAGE_ONE_LOWER_DENSITY_MIN_CHARS = 160;
const DEFAULT_LOWER_DENSITY_MIN_ROWS = 2;
const DEFAULT_LOWER_DENSITY_MIN_CHARS = 80;
const SINGLE_PAGE_TOP_TEXT_Y_MIN = 735;
const SINGLE_PAGE_TOP_TEXT_Y_MAX = 755;
const SINGLE_PAGE_BOTTOM_TEXT_Y_MIN = 90;
const SINGLE_PAGE_BOTTOM_TEXT_Y_MAX = 110;
const FULL_PAGE_ONE_SKILLS_HEADING_Y_MIN = 160;
const FULL_PAGE_ONE_SKILLS_HEADING_Y_MAX = 190;
const FULL_PAGE_ONE_BOTTOM_TEXT_Y_MIN = 90;
const FULL_PAGE_ONE_BOTTOM_TEXT_Y_MAX = 120;
const FULL_PAGE_TWO_PROJECT_HEADING_DELTA_SPREAD_MAX = 8;
const PERSONAL_WEBSITE_PROJECT_NAME = "Personal Website: w4w.dev";
const NBA_DATABASE_PROJECT_NAME = "NBA Basketball Database";
const PROXYWHIRL_PROJECT_NAME = "ProxyWhirl";
const LEGACY_SOURCE_COUNT_PATTERN =
  /\b114(?:\+)?\s+(?:auto-validated\s+)?sources?\b/i;
const PROJECT_SECTION_END_HEADINGS = [
  "Education & Certifications",
  "Education",
  "Certifications",
  "Publications",
] as const;

interface PdfExpectation {
  fileName: string;
  expectedPages: number;
}

interface DocxArtifactPolicy {
  showSummary: boolean;
  showWorkSummaries: boolean;
  showProjectHighlights: boolean;
  projectSectionStartsOnNewPage: boolean;
}

interface LoadedArtifactSpecs {
  full: {
    docx: DocxArtifactPolicy;
  };
  single: {
    docx: DocxArtifactPolicy;
  };
}

interface NamedSelection {
  name: string;
}

interface ProfileSelection {
  network: string;
  url: string;
}

interface ResumeSelection {
  basics: {
    name: string;
    email: string;
    phone: string;
    url: string;
    summary?: string;
    label?: string;
    location: {
      city: string;
      region: string;
    };
    profiles: ProfileSelection[];
  };
  work: WorkSelection[];
  skills?: SkillSelection[];
  projects?: ProjectSelection[];
}

interface WorkSelection extends NamedSelection {
  position: string;
  startDate: string;
  endDate: string | null;
  location?: string;
  summary?: string;
  highlights: string[];
}

interface SkillSelection extends NamedSelection {
  keywords: string[];
}

interface ProjectSelection extends NamedSelection {
  description: string;
  githubUrl: string;
  highlights: string[];
  stack?: string[];
}

interface PdfTextItemMetric {
  text: string;
  y: number;
}

interface WorkVariantSelection extends NamedSelection {
  summary?: string | null;
  highlightIndexes?: number[];
}

interface SkillVariantSelection extends NamedSelection {
  keywordIndexes?: number[];
}

interface ProjectVariantSelection extends NamedSelection {
  description?: string;
  highlightIndexes?: number[];
  highlights?: string[];
}

interface VariantContentSelection {
  basics?: {
    summary?: string;
  };
  work?: WorkVariantSelection[];
  projects?: ProjectVariantSelection[];
  skills?: SkillVariantSelection[];
  education?: string[];
  certificates?: string[];
  publications?: string[];
}

interface ResolvedVariantContentSelection {
  summary?: string;
  work: WorkSelection[];
  projects: ProjectSelection[];
  skills: SkillSelection[];
  education: string[];
  certificates: string[];
  publications: string[];
}

const expectedArtifacts = [
  "resume-full.pdf",
  "resume-full.docx",
  "resume-full.png",
  "resume-single.pdf",
  "resume-single.docx",
  "resume-single.png",
] as const;

const pdfExpectations: PdfExpectation[] = [
  { fileName: "resume-full.pdf", expectedPages: 2 },
  { fileName: "resume-single.pdf", expectedPages: 1 },
];

const publicDownloadPdfExpectations: PdfExpectation[] = [
  { fileName: "wyatt-walsh-resume-full.pdf", expectedPages: 2 },
  { fileName: "wyatt-walsh-resume-single.pdf", expectedPages: 1 },
];

const publicDownloadDocxArtifacts = [
  "wyatt-walsh-resume-full.docx",
  "wyatt-walsh-resume-single.docx",
] as const;

const artifactParityPairs = [
  {
    generatedFileName: "resume-full.pdf",
    publicFileName: "wyatt-walsh-resume-full.pdf",
  },
  {
    generatedFileName: "resume-single.pdf",
    publicFileName: "wyatt-walsh-resume-single.pdf",
  },
  {
    generatedFileName: "resume-full.docx",
    publicFileName: "wyatt-walsh-resume-full.docx",
  },
  {
    generatedFileName: "resume-single.docx",
    publicFileName: "wyatt-walsh-resume-single.docx",
  },
] as const;

const seniorAiMlTargetKeywords = [
  "Senior AI/ML Engineer",
  "agentic AI",
  "LLM document intelligence",
  "data pipelines",
  "fintech",
  "risk",
  "compliance",
  "PydanticAI",
  "Amazon Bedrock",
  "Claude",
  "Python",
  "SQL",
  "GitHub Copilot",
  "Model Context Protocol (MCP)",
  "Retrieval Augmented Generation (RAG)",
] as const;

function fail(message: string): never {
  throw new Error(message);
}

async function runRequiredCli(
  command: string,
  args: string[],
  context: string,
) {
  try {
    const { stdout } = await execFileAsync(command, args, {
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException & {
      stderr?: string;
      stdout?: string;
    };

    if (typedError.code === "ENOENT") {
      fail(
        `${context} requires the "${command}" CLI. Install poppler-utils locally or in CI before running artifact checks.`,
      );
    }

    fail(
      `${context} failed while running "${command} ${args.join(" ")}": ${
        typedError.stderr ?? typedError.stdout ?? typedError.message
      }`,
    );
  }
}

function isWithinTolerance(value: number, expected: number) {
  return Math.abs(value - expected) <= LETTER_SIZE_TOLERANCE;
}

function getLowestTextYThreshold(expectedPages: number, pageNumber: number) {
  if (expectedPages > 1) {
    return pageNumber === 1
      ? FULL_PAGE_ONE_LOWEST_TEXT_Y_MAX
      : FULL_PAGE_TWO_LOWEST_TEXT_Y_MAX;
  }

  return SINGLE_PAGE_LOWEST_TEXT_Y_MAX;
}

function getPdfTextItemMetric(item: unknown): PdfTextItemMetric | null {
  if (
    typeof item !== "object" ||
    item === null ||
    !("str" in item) ||
    !("transform" in item)
  ) {
    return null;
  }

  const candidate = item as { str?: unknown; transform?: unknown };

  if (
    typeof candidate.str !== "string" ||
    !candidate.str.trim() ||
    !Array.isArray(candidate.transform)
  ) {
    return null;
  }

  const y = candidate.transform[5];
  return typeof y === "number" ? { text: candidate.str.trim(), y } : null;
}

function getLowerDensityThresholds(expectedPages: number, pageNumber: number) {
  if (expectedPages > 1 && pageNumber === 1) {
    return {
      minRows: FULL_PAGE_ONE_LOWER_DENSITY_MIN_ROWS,
      minChars: FULL_PAGE_ONE_LOWER_DENSITY_MIN_CHARS,
    };
  }

  return {
    minRows: DEFAULT_LOWER_DENSITY_MIN_ROWS,
    minChars: DEFAULT_LOWER_DENSITY_MIN_CHARS,
  };
}

function getLowerDensityBandYMax(expectedPages: number, pageNumber: number) {
  if (expectedPages > 1 && pageNumber === 1) {
    return FULL_PAGE_ONE_LOWER_DENSITY_BAND_Y_MAX;
  }

  if (expectedPages > 1 && pageNumber === 2) {
    return FULL_PAGE_TWO_LOWER_DENSITY_BAND_Y_MAX;
  }

  return DEFAULT_LOWER_DENSITY_BAND_Y_MAX;
}

function assertLowerPageDensity(
  textItems: PdfTextItemMetric[],
  label: string,
  expectedPages: number,
  pageNumber: number,
) {
  const lowerDensityBandYMax = getLowerDensityBandYMax(expectedPages, pageNumber);
  const lowerBandItems = textItems.filter(
    (item) => item.y <= lowerDensityBandYMax,
  );
  const lowerBandRows = new Set(
    lowerBandItems.map((item) => Math.round(item.y)),
  );
  const lowerBandChars = lowerBandItems.reduce(
    (total, item) => total + item.text.length,
    0,
  );
  const { minRows, minChars } = getLowerDensityThresholds(
    expectedPages,
    pageNumber,
  );

  if (lowerBandRows.size < minRows && lowerBandChars < minChars) {
    fail(
      `${label} page ${pageNumber} lower-page density is too thin; found ${lowerBandRows.size} row(s) and ${lowerBandChars} text chars at <= ${lowerDensityBandYMax}pt, expected at least ${minRows} row(s) or ${minChars} chars.`,
    );
  }

  console.log(
    `✓ ${label} page ${pageNumber} lower-page density has ${lowerBandRows.size} row(s) and ${lowerBandChars} chars`,
  );
}

function normalizeForStrictIncludes(text: string) {
  return text
    .replace(/-\s+/g, "")
    .replace(/-/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([:;,.])/g, "$1")
    .trim();
}

function assertStrictTextIncludes(
  haystack: string,
  needle: string,
  context: string,
) {
  const normalizedHaystack = normalizeForStrictIncludes(haystack).toLowerCase();
  const normalizedNeedle = normalizeForStrictIncludes(needle).toLowerCase();

  if (!normalizedHaystack.includes(normalizedNeedle)) {
    fail(`${context} must contain parseable contiguous text "${needle}".`);
  }
}

function assertStrictTextExcludes(
  haystack: string,
  needle: string,
  context: string,
) {
  const normalizedHaystack = normalizeForStrictIncludes(haystack).toLowerCase();
  const normalizedNeedle = normalizeForStrictIncludes(needle).toLowerCase();

  if (normalizedHaystack.includes(normalizedNeedle)) {
    fail(`${context} must not contain parseable contiguous text "${needle}".`);
  }
}

function stripUrlForDisplay(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    const pathname = parsedUrl.pathname.replace(/\/$/, "");
    return `${hostname}${pathname}`;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildLooseNeedlePattern(needle: string) {
  const words = needle.match(/[a-z0-9]+/gi);

  if (!words?.length) {
    return null;
  }

  return words
    .map((word) =>
      word
        .split("")
        .map((char) => escapeRegExp(char))
        .join("\\s*"),
    )
    .join("[^a-z0-9]+");
}

function findNormalizedIndex(haystack: string, needle: string, fromIndex = 0) {
  const pattern = buildLooseNeedlePattern(needle);

  if (!pattern) {
    return -1;
  }

  const matcher = new RegExp(`(^|[^a-z0-9])(${pattern})(?=[^a-z0-9]|$)`, "i");
  const slice = haystack.slice(fromIndex);
  const match = matcher.exec(slice);

  if (!match) {
    return -1;
  }

  return fromIndex + match.index + match[1].length;
}

function getNormalizedIndex(
  haystack: string,
  needle: string,
  context: string,
  fromIndex = 0,
  notFoundMessage?: string,
) {
  const index = findNormalizedIndex(haystack, needle, fromIndex);

  if (index === -1) {
    fail(notFoundMessage ?? `${context} must contain "${needle}".`);
  }

  return index;
}

function assertNormalizedTextIncludes(
  haystack: string,
  needle: string,
  context: string,
) {
  getNormalizedIndex(haystack, needle, context);
}

function assertNormalizedTextExcludes(
  haystack: string,
  needle: string,
  context: string,
) {
  if (findNormalizedIndex(haystack, needle) !== -1) {
    fail(`${context} must not contain "${needle}".`);
  }
}

function assertTextExcludesPattern(
  haystack: string,
  pattern: RegExp,
  context: string,
  description: string,
) {
  if (pattern.test(normalizeForStrictIncludes(haystack))) {
    fail(`${context} must not contain ${description}.`);
  }
}

function getTextItemY(
  textItems: PdfTextItemMetric[],
  needle: string,
  context: string,
) {
  const normalizedNeedle = normalizeForStrictIncludes(needle).toLowerCase();
  const matches = textItems.filter(
    (item) =>
      normalizeForStrictIncludes(item.text).toLowerCase() === normalizedNeedle,
  );

  if (!matches.length) {
    fail(`${context} must contain "${needle}".`);
  }

  return Math.max(...matches.map((item) => item.y));
}

function assertTextYWithinRange(
  value: number,
  minimum: number,
  maximum: number,
  context: string,
) {
  if (value < minimum || value > maximum) {
    fail(
      `${context} must stay between ${minimum}pt and ${maximum}pt; found ${value.toFixed(1)}pt.`,
    );
  }

  console.log(`✓ ${context} is ${value.toFixed(1)}pt`);
}

function getOrderedTextBlock(
  haystack: string,
  needle: string,
  orderedNeedles: string[],
  context: string,
) {
  const needleIndex = orderedNeedles.indexOf(needle);

  if (needleIndex === -1) {
    fail(`${context} is missing ordered entry "${needle}".`);
  }

  const startIndex = getNormalizedIndex(haystack, needle, context);
  const endIndexCandidates = [
    ...orderedNeedles.slice(needleIndex + 1),
    ...PROJECT_SECTION_END_HEADINGS,
  ]
    .map((candidate) =>
      findNormalizedIndex(haystack, candidate, startIndex + needle.length),
    )
    .filter((index) => index > startIndex);
  const endIndex = endIndexCandidates.length
    ? Math.min(...endIndexCandidates)
    : haystack.length;

  return haystack.slice(startIndex, endIndex);
}

function assertArtifactContentConsistency(
  text: string,
  label: string,
  resume: ResumeSelection,
  variant: ResolvedVariantContentSelection,
) {
  const context = `${label} content consistency`;
  const selectedProjectNames = getSelectionNames(variant.projects);
  const omittedProjectNames = (resume.projects ?? [])
    .map((project) => project.name)
    .filter((projectName) => !selectedProjectNames.includes(projectName));

  if (selectedProjectNames.includes(PERSONAL_WEBSITE_PROJECT_NAME)) {
    assertNormalizedTextIncludes(text, PERSONAL_WEBSITE_PROJECT_NAME, context);
  }

  for (const projectName of omittedProjectNames) {
    assertNormalizedTextExcludes(text, projectName, context);
  }

  assertTextExcludesPattern(
    text,
    LEGACY_SOURCE_COUNT_PATTERN,
    context,
    'the brittle "114 sources" phrasing',
  );

  if (selectedProjectNames.includes(PROXYWHIRL_PROJECT_NAME)) {
    const proxyWhirlBlock = getOrderedTextBlock(
      text,
      PROXYWHIRL_PROJECT_NAME,
      selectedProjectNames,
      `${context} ProxyWhirl entry`,
    );
    assertStrictTextIncludes(
      proxyWhirlBlock,
      "100+",
      `${context} ProxyWhirl entry`,
    );
  }

  if (selectedProjectNames.includes(NBA_DATABASE_PROJECT_NAME)) {
    const nbaDatabaseBlock = getOrderedTextBlock(
      text,
      NBA_DATABASE_PROJECT_NAME,
      selectedProjectNames,
      `${context} NBA Basketball Database entry`,
    );
    assertStrictTextIncludes(
      nbaDatabaseBlock,
      "425K+ views and 60K+ downloads",
      `${context} NBA Basketball Database entry`,
    );
    assertStrictTextIncludes(
      nbaDatabaseBlock,
      "2023-07-06",
      `${context} NBA Basketball Database entry`,
    );
  }

  const selectedCredentials = [...variant.education, ...variant.certificates];
  if (selectedCredentials.length) {
    assertNormalizedTextIncludesAll(text, selectedCredentials, context);
  }

  console.log(`✓ ${label} keeps curated project and credential content consistent`);
}

async function readVariantSelection(
  filePath: string,
): Promise<VariantContentSelection> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as VariantContentSelection;
}

async function readResumeSelection(filePath: string): Promise<ResumeSelection> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as ResumeSelection;
}

async function loadArtifactSpecs() {
  const source = await fs.readFile(ARTIFACT_SPECS_PATH, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: ARTIFACT_SPECS_PATH,
  });
  const module = { exports: {} as { artifactSpecs?: LoadedArtifactSpecs } };

  // build:script only compiles src/scripts, so load the source artifact contract
  // directly at runtime instead of introducing a cross-project TS import edge.
  new Function("exports", "module", outputText)(module.exports, module);

  if (!module.exports.artifactSpecs) {
    fail("artifact-specs.ts must export artifactSpecs for artifact checks.");
  }

  return module.exports.artifactSpecs;
}

function pickByIndexes<T>(values: T[], indexes: number[] | undefined) {
  if (!indexes) {
    return values;
  }

  return indexes.map((index) => {
    const value = values[index];

    if (value === undefined) {
      fail(`Variant index "${index}" is outside the selected content bounds.`);
    }

    return value;
  });
}

function getByName<T extends NamedSelection>(
  items: T[] | undefined,
  name: string,
  sectionLabel: string,
) {
  const match = items?.find((item) => item.name === name);

  if (!match) {
    fail(`Unknown ${sectionLabel} entry "${name}".`);
  }

  return match;
}

function resolveVariantContent(
  resume: ResumeSelection,
  variant: VariantContentSelection,
): ResolvedVariantContentSelection {
  return {
    summary: variant.basics?.summary ?? resume.basics.summary,
    work: (variant.work ?? resume.work).map((selection) => {
      const baseWork = getByName(resume.work, selection.name, "work");

      return {
        ...baseWork,
        ...(selection.summary === undefined
          ? {}
          : { summary: selection.summary ?? undefined }),
        highlights: pickByIndexes(
          baseWork.highlights,
          "highlightIndexes" in selection
            ? selection.highlightIndexes
            : undefined,
        ),
      };
    }),
    projects: (variant.projects ?? resume.projects ?? []).map((selection) => {
      const baseProject = getByName(resume.projects, selection.name, "project");

      return {
        ...baseProject,
        description:
          "description" in selection && selection.description
            ? selection.description
            : baseProject.description,
        highlights:
          "highlights" in selection && selection.highlights
            ? selection.highlights
            : pickByIndexes(
                baseProject.highlights,
                "highlightIndexes" in selection
                  ? selection.highlightIndexes
                  : undefined,
              ),
      };
    }),
    skills: (variant.skills ?? resume.skills ?? []).map((selection) => {
      const baseSkill = getByName(resume.skills, selection.name, "skill");

      return {
        ...baseSkill,
        keywords: pickByIndexes(
          baseSkill.keywords,
          "keywordIndexes" in selection ? selection.keywordIndexes : undefined,
        ),
      };
    }),
    education: variant.education ?? [],
    certificates: variant.certificates ?? [],
    publications: variant.publications ?? [],
  };
}

function getSelectionNames(selections: NamedSelection[] | undefined) {
  return (selections ?? []).map(({ name }) => name);
}

function assertNormalizedTextIncludesAll(
  haystack: string,
  needles: string[],
  context: string,
) {
  for (const needle of needles) {
    assertNormalizedTextIncludes(haystack, needle, context);
  }
}

function assertNormalizedSectionOrder(
  haystack: string,
  needles: string[],
  context: string,
): Record<string, number> {
  const positions: Record<string, number> = {};
  let previousIndex = -1;
  let previousNeedle: string | undefined;
  let searchFrom = 0;

  for (const needle of needles) {
    const index = getNormalizedIndex(
      haystack,
      needle,
      context,
      searchFrom,
      previousNeedle
        ? `${context} must keep "${needle}" after "${previousNeedle}".`
        : undefined,
    );

    if (index <= previousIndex) {
      fail(`${context} must keep "${needle}" after "${previousNeedle}".`);
    }

    positions[needle] = index;
    previousIndex = index;
    previousNeedle = needle;
    searchFrom = index + needle.length;
  }

  return positions;
}

function formatAtsMonthYear(date: string) {
  const [year, month] = date.split("-").map(Number);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (!year || !month || month < 1 || month > 12) {
    fail(`Invalid resume date "${date}".`);
  }

  return `${monthNames[month - 1]} ${year}`;
}

function assertContactFieldsBeforeExperience(
  text: string,
  label: string,
  resume: ResumeSelection,
) {
  const context = `${label} contact block`;
  const experienceIndex = getNormalizedIndex(text, "Experience", context);
  const profileUrls = resume.basics.profiles.map((profile) =>
    stripUrlForDisplay(profile.url),
  );
  const fields = [
    resume.basics.name,
    resume.basics.label ?? "Senior AI/ML Engineer",
    resume.basics.email,
    resume.basics.phone,
    `${resume.basics.location.city}, ${resume.basics.location.region}`,
    ...profileUrls,
  ];

  let searchFrom = 0;
  for (const field of fields) {
    const index = getNormalizedIndex(text, field, context, searchFrom);

    if (index >= experienceIndex) {
      fail(`${context} must keep "${field}" before the Experience section.`);
    }

    searchFrom = index + field.length;
  }
}

function getExpectedAtsSections(variant: ResolvedVariantContentSelection) {
  const expectedSections = ["Experience"];

  if (variant.skills.length) {
    expectedSections.push("Skills");
  }

  if (variant.projects.length) {
    expectedSections.push("Projects");
  }

  if (variant.education.length) {
    expectedSections.push("Education");
  }

  if (variant.certificates.length) {
    expectedSections.push("Certifications");
  }

  if (variant.publications.length) {
    expectedSections.push("Publications");
  }

  return expectedSections;
}

function getExpectedLayoutSectionHeadings(
  variant: ResolvedVariantContentSelection,
) {
  const expectedSections = ["Experience"];

  if (variant.skills.length) {
    expectedSections.push("Skills");
  }

  if (variant.projects.length) {
    expectedSections.push("Projects");
  }

  if (variant.education.length || variant.certificates.length) {
    expectedSections.push("Education & Certifications");
  }

  if (variant.publications.length) {
    expectedSections.push("Publications");
  }

  return expectedSections;
}

function assertStandardAtsSectionOrder(
  text: string,
  label: string,
  variant: ResolvedVariantContentSelection,
) {
  const expectedSections = getExpectedAtsSections(variant);

  assertNormalizedSectionOrder(
    text,
    expectedSections,
    `${label} section order`,
  );
}

function findLayoutSectionHeadingIndex(
  text: string,
  sectionName: string,
  fromIndex = 0,
) {
  const heading = sectionName.replace(/:$/, "");
  const matcher = new RegExp(`(^|\\n)\\s*${escapeRegExp(heading)}:?\\b`, "i");
  const slice = text.slice(fromIndex);
  const match = matcher.exec(slice);

  if (!match) {
    return -1;
  }

  return fromIndex + match.index + match[1].length;
}

function assertLayoutAtsSectionHeadings(
  text: string,
  label: string,
  variant: ResolvedVariantContentSelection,
) {
  const context = `${label} layout section headings`;
  const expectedSections = getExpectedLayoutSectionHeadings(variant);
  let searchFrom = 0;

  for (const sectionName of expectedSections) {
    const index = findLayoutSectionHeadingIndex(text, sectionName, searchFrom);

    if (index === -1) {
      fail(`${context} must contain a standalone "${sectionName}" heading.`);
    }

    searchFrom = index + sectionName.length;
  }
}

function assertRolePatternsExtractCleanly(
  text: string,
  label: string,
  variant: ResolvedVariantContentSelection,
) {
  const context = `${label} role block`;
  const skillsIndex = getNormalizedIndex(text, "Skills", context);
  let searchFrom = getNormalizedIndex(text, "Experience", context);

  for (const job of variant.work) {
    const positionIndex = getNormalizedIndex(
      text,
      job.position,
      context,
      searchFrom,
    );
    const companyIndex = getNormalizedIndex(
      text,
      job.name,
      context,
      positionIndex,
    );
    const afterCompanyIndex = job.location
      ? getNormalizedIndex(text, job.location, context, companyIndex)
      : companyIndex;
    const startDateIndex = getNormalizedIndex(
      text,
      formatAtsMonthYear(job.startDate),
      context,
      afterCompanyIndex,
    );
    const endDateIndex = job.endDate
      ? getNormalizedIndex(
          text,
          formatAtsMonthYear(job.endDate),
          context,
          startDateIndex,
        )
      : startDateIndex;

    if (positionIndex >= skillsIndex || companyIndex >= skillsIndex) {
      fail(`${context} must keep "${job.name}" inside the Experience section.`);
    }

    searchFrom =
      endDateIndex + formatAtsMonthYear(job.endDate ?? job.startDate).length;
  }
}

function assertSeniorAiMlTargetKeywords(text: string, label: string) {
  for (const keyword of seniorAiMlTargetKeywords) {
    assertStrictTextIncludes(text, keyword, `${label} target keywords`);
  }
}

function assertNoRedundantUrlLabels(text: string, label: string) {
  const redundantUrlLabel =
    /\b(?:LinkedIn|GitHub):\s*(?:linkedin\.com|github\.com)\//i;

  if (redundantUrlLabel.test(text)) {
    fail(
      `${label} must use bare profile and project URLs without redundant labels.`,
    );
  }
}

function assertNoDanglingSkillSeparators(text: string, label: string) {
  const context = `${label} Skills section`;
  const skillsIndex = findLayoutSectionHeadingIndex(text, "Skills");

  if (skillsIndex === -1) {
    fail(`${context} must contain a standalone Skills heading.`);
  }

  const nextSectionIndexes = [
    "Projects",
    "Education",
    "Certifications",
    "Publications",
  ]
    .map((sectionName) =>
      findLayoutSectionHeadingIndex(
        text,
        sectionName,
        skillsIndex + "Skills".length,
      ),
    )
    .filter((index) => index > skillsIndex);
  const nextSectionIndex = nextSectionIndexes.length
    ? Math.min(...nextSectionIndexes)
    : Number.POSITIVE_INFINITY;
  const skillsText = text.slice(skillsIndex, nextSectionIndex);
  const malformedLine = skillsText
    .split(/\r?\n/)
    .find((line) => /^\s*\|/.test(line) || /\|\s*$/.test(line));

  if (malformedLine) {
    fail(
      `${context} must not contain a dangling pipe separator; found "${malformedLine.trim()}".`,
    );
  }
}

function assertEntriesStayWithinSection(
  haystack: string,
  entries: string[],
  startNeedle: string,
  endNeedle: string | null,
  context: string,
) {
  const startIndex = getNormalizedIndex(haystack, startNeedle, context);
  const endIndex = endNeedle
    ? getNormalizedIndex(haystack, endNeedle, context)
    : Number.POSITIVE_INFINITY;

  for (const entry of entries) {
    const entryIndex = getNormalizedIndex(haystack, entry, context);

    if (entryIndex <= startIndex) {
      fail(
        `${context} must keep "${entry}" after the "${startNeedle}" heading.`,
      );
    }

    if (entryIndex >= endIndex) {
      fail(
        `${context} must keep "${entry}" before the "${endNeedle}" heading.`,
      );
    }
  }
}

async function assertArtifactExists(
  fileName: (typeof expectedArtifacts)[number],
) {
  const filePath = path.join(OUTPUT_DIR, fileName);

  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException;

    if (typedError.code === "ENOENT") {
      fail(`Missing generated artifact: ${fileName}`);
    }

    fail(`Unable to inspect ${fileName}: ${typedError.message}`);
  }

  if (!stats.isFile()) {
    fail(`Expected ${fileName} to be a file.`);
  }

  if (stats.size === 0) {
    fail(`Generated artifact is empty: ${fileName}`);
  }

  console.log(`✓ Found ${path.relative(process.cwd(), filePath)}`);

  if (SHOULD_SKIP_ARTIFACT_RECENCY) {
    console.log(
      `✓ Skipped generated-artifact recency check for ${fileName} because RESUME_ARTIFACT_RECENCY=skip`,
    );
    return filePath;
  }

  if (Date.now() - stats.mtimeMs > MAX_ARTIFACT_AGE_MS) {
    fail(`Generated artifact looks stale: ${fileName}`);
  }

  console.log(`✓ ${fileName} was generated recently`);
  return filePath;
}

async function assertPublicDownloadExists(fileName: string) {
  const filePath = path.join(PUBLIC_DOWNLOADS_DIR, fileName);

  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException;

    if (typedError.code === "ENOENT") {
      fail(`Missing public download artifact: ${fileName}`);
    }

    fail(
      `Unable to inspect public download ${fileName}: ${typedError.message}`,
    );
  }

  if (!stats.isFile()) {
    fail(`Expected public download ${fileName} to be a file.`);
  }

  if (stats.size === 0) {
    fail(`Public download artifact is empty: ${fileName}`);
  }

  console.log(`✓ Found ${path.relative(process.cwd(), filePath)}`);
  return filePath;
}

async function getFileSha256(filePath: string) {
  const buffer = await fs.readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

async function assertMatchingArtifactHash(
  generatedFilePath: string,
  publicFilePath: string,
  generatedLabel: string,
  publicLabel: string,
) {
  const [generatedHash, publicHash] = await Promise.all([
    getFileSha256(generatedFilePath),
    getFileSha256(publicFilePath),
  ]);

  if (generatedHash !== publicHash) {
    fail(
      `${generatedLabel} SHA-256 (${generatedHash}) must match ${publicLabel} (${publicHash}).`,
    );
  }

  console.log(`✓ ${generatedLabel} SHA-256 matches ${publicLabel}`);
}

async function getPdfPageText(
  filePath: string,
  pageNumber: number,
): Promise<{
  text: string;
  normalizedText: string;
  textItems: PdfTextItemMetric[];
  highestTextY: number;
  lowestTextY: number;
}> {
  const data = new Uint8Array(await fs.readFile(filePath));
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    useWorkerFetch: false,
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;

  try {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const textItems = content.items
      .map(getPdfTextItemMetric)
      .filter((item): item is PdfTextItemMetric => item !== null);
    const text = textItems
      .map((item) => item.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const yCoordinates = textItems.map((item) => item.y);

    if (!yCoordinates.length) {
      fail(`${path.basename(filePath)} page ${pageNumber} must contain parseable text.`);
    }

    return {
      text,
      normalizedText: text,
      textItems,
      highestTextY: Math.max(...yCoordinates),
      lowestTextY: Math.min(...yCoordinates),
    };
  } finally {
    await pdf.destroy();
  }
}

async function getPdfAllText(filePath: string) {
  const data = new Uint8Array(await fs.readFile(filePath));
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    useWorkerFetch: false,
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => {
          if (typeof item !== "object" || item === null || !("str" in item)) {
            return "";
          }

          return typeof item.str === "string" ? item.str : "";
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pages.push(text);
    }

    return pages.join("\n");
  } finally {
    await pdf.destroy();
  }
}

async function assertPdfExpectations(
  filePath: string,
  label: string,
  expectedPages: number,
) {
  const data = new Uint8Array(await fs.readFile(filePath));
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    useWorkerFetch: false,
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;

  try {
    if (pdf.numPages !== expectedPages) {
      fail(
        `${label} should have ${expectedPages} page(s), found ${pdf.numPages}.`,
      );
    }

    console.log(`✓ ${label} has ${expectedPages} page(s)`);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });

      if (
        !isWithinTolerance(viewport.width, LETTER_WIDTH_POINTS) ||
        !isWithinTolerance(viewport.height, LETTER_HEIGHT_POINTS)
      ) {
        fail(
          `${label} page ${pageNumber} should be letter sized (${LETTER_WIDTH_POINTS}x${LETTER_HEIGHT_POINTS}), found ${viewport.width.toFixed(2)}x${viewport.height.toFixed(2)}.`,
        );
      }

      const content = await page.getTextContent();
      const textItems = content.items
        .map(getPdfTextItemMetric)
        .filter((item): item is PdfTextItemMetric => item !== null);
      const yCoordinates = textItems.map((item) => item.y);

      if (!yCoordinates.length) {
        fail(`${label} page ${pageNumber} must contain parseable text.`);
      }

      const lowestTextY = Math.min(...yCoordinates);
      const lowestTextYMax = getLowestTextYThreshold(expectedPages, pageNumber);

      if (lowestTextY > lowestTextYMax) {
        fail(
          `${label} page ${pageNumber} leaves too much bottom whitespace; lowest text baseline is ${lowestTextY.toFixed(1)}pt and must be <= ${lowestTextYMax}pt.`,
        );
      }

      assertLowerPageDensity(textItems, label, expectedPages, pageNumber);
    }

    console.log(`✓ ${label} uses letter-sized pages`);
    console.log(`✓ ${label} uses the expected page height`);
  } finally {
    await pdf.destroy();
  }
}

function getPdfInfoValue(pdfInfo: string, fieldName: string) {
  const matcher = new RegExp(`^${escapeRegExp(fieldName)}:\\s*(.+)$`, "im");
  return matcher.exec(pdfInfo)?.[1]?.trim();
}

async function assertPdfMetadataIsAtsSafe(
  filePath: string,
  label: string,
  expectedPages: number,
) {
  const pdfInfo = await runRequiredCli("pdfinfo", [filePath], label);

  if (getPdfInfoValue(pdfInfo, "Tagged")?.toLowerCase() !== "yes") {
    fail(`${label} must remain a tagged PDF.`);
  }

  if (getPdfInfoValue(pdfInfo, "Encrypted")?.toLowerCase() !== "no") {
    fail(`${label} must not be encrypted.`);
  }

  if (getPdfInfoValue(pdfInfo, "JavaScript")?.toLowerCase() !== "no") {
    fail(`${label} must not contain PDF JavaScript.`);
  }

  const pageCount = Number(getPdfInfoValue(pdfInfo, "Pages"));
  if (pageCount !== expectedPages) {
    fail(`${label} must have ${expectedPages} page(s), found ${pageCount}.`);
  }

  console.log(`✓ ${label} metadata is ATS-safe`);
}

async function assertPdfFontsAreAtsSafe(filePath: string, label: string) {
  const fontTable = await runRequiredCli("pdffonts", [filePath], label);
  const rows = fontTable
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) => line && !line.startsWith("name") && !line.startsWith("-"),
    );

  if (!rows.length) {
    fail(`${label} must expose embedded fonts to pdffonts.`);
  }

  for (const row of rows) {
    if (/\bType\s+3\b/.test(row)) {
      fail(`${label} must not use Type 3 fonts; found "${row}".`);
    }

    const columns = row.split(/\s+/);
    const embedded = columns[columns.length - 5];
    const subset = columns[columns.length - 4];
    const unicode = columns[columns.length - 3];

    if (embedded !== "yes" || subset !== "yes" || unicode !== "yes") {
      fail(
        `${label} fonts must be embedded, subset, and Unicode-mapped; found "${row}".`,
      );
    }
  }

  console.log(`✓ ${label} uses embedded Unicode fonts without Type 3 fonts`);
}

async function assertPdfContainsNoImages(filePath: string, label: string) {
  const imageTable = await runRequiredCli(
    "pdfimages",
    ["-list", filePath],
    label,
  );
  const imageRows = imageTable
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\s+\d+\s+/.test(line));

  if (imageRows.length) {
    fail(`${label} must not contain embedded raster images.`);
  }

  console.log(`✓ ${label} contains no embedded images`);
}

async function getPopplerText(filePath: string, label: string) {
  const [text, layoutText] = await Promise.all([
    runRequiredCli("pdftotext", [filePath, "-"], label),
    runRequiredCli("pdftotext", ["-layout", filePath, "-"], label),
  ]);

  return { text, layoutText };
}

function decodeXmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractDocxText(documentXml: string) {
  return decodeXmlEntities(
    documentXml
      .replace(/<w:tab\b[^>]*\/>/g, " ")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

async function getDocxXml(filePath: string, label: string) {
  const [documentXml, relationshipsXml] = await Promise.all([
    runRequiredCli("unzip", ["-p", filePath, "word/document.xml"], label),
    runRequiredCli(
      "unzip",
      ["-p", filePath, "word/_rels/document.xml.rels"],
      label,
    ),
  ]);

  return { documentXml, relationshipsXml };
}

function assertDocxHyperlinkTargets(
  relationshipsXml: string,
  label: string,
  resume: ResumeSelection,
  variant: ResolvedVariantContentSelection,
) {
  const requiredTargets = [
    resume.basics.url,
    `mailto:${resume.basics.email}`,
    `tel:${resume.basics.phone}`,
    ...resume.basics.profiles.map((profile) => profile.url),
    ...variant.projects.map((project) => project.githubUrl),
  ];

  for (const target of requiredTargets) {
    if (!relationshipsXml.includes(target)) {
      fail(`${label} DOCX relationships must contain hyperlink target "${target}".`);
    }
  }
}

function getParagraphXmlContainingText(
  documentXml: string,
  needle: string,
  context: string,
) {
  const matcher = new RegExp(
    `<w:p\\b[\\s\\S]*?<w:t[^>]*>${escapeRegExp(needle)}<\\/w:t>[\\s\\S]*?<\\/w:p>`,
    "i",
  );
  const match = matcher.exec(documentXml);

  if (!match?.[0]) {
    fail(`${context} must contain a paragraph for "${needle}".`);
  }

  return match[0];
}

function assertDocxPolicy(
  documentXml: string,
  text: string,
  label: string,
  variant: ResolvedVariantContentSelection,
  policy: DocxArtifactPolicy,
) {
  const context = `${label} DOCX policy`;

  if (variant.summary) {
    if (policy.showSummary) {
      assertStrictTextIncludes(text, variant.summary, context);
    } else {
      assertStrictTextExcludes(text, variant.summary, context);
    }
  }

  const workSummaries = variant.work
    .map((job) => job.summary)
    .filter((summary): summary is string => Boolean(summary));
  for (const summary of workSummaries) {
    if (policy.showWorkSummaries) {
      assertStrictTextIncludes(text, summary, context);
    } else {
      assertStrictTextExcludes(text, summary, context);
    }
  }

  const projectHighlights = variant.projects.flatMap((project) => project.highlights);
  for (const highlight of projectHighlights) {
    if (policy.showProjectHighlights) {
      assertStrictTextIncludes(text, highlight, context);
    } else {
      assertStrictTextExcludes(text, highlight, context);
    }
  }

  const projectsHeadingParagraph = getParagraphXmlContainingText(
    documentXml,
    "Projects",
    context,
  );
  const hasPageBreakBefore = /<w:pageBreakBefore\b[^/>]*(?:\/>|>)/i.test(
    projectsHeadingParagraph,
  );

  if (policy.projectSectionStartsOnNewPage && !hasPageBreakBefore) {
    fail(`${context} must start the Projects section on a new page.`);
  }

  if (!policy.projectSectionStartsOnNewPage && hasPageBreakBefore) {
    fail(`${context} must keep the Projects section inline without a page break.`);
  }

  console.log(`✓ ${label} satisfies the explicit DOCX policy`);
}

function assertNoLetterSpacedHeadings(text: string, label: string) {
  const collapsed = normalizeForStrictIncludes(text);
  const letterSpacedNeedles = [
    "S E N I O R",
    "A I / M L",
    "E N G I N E E R",
    "E X P E R I E N C E",
    "S K I L L S",
    "P R O J E C T S",
    "E D U C A T I O N",
    "C E R T I F I C A T I O N S",
  ];

  for (const needle of letterSpacedNeedles) {
    if (collapsed.includes(needle)) {
      fail(`${label} must not extract letter-spaced heading text "${needle}".`);
    }
  }
}

function assertParseableCoreFields(
  text: string,
  label: string,
  resume: ResumeSelection,
  variant: ResolvedVariantContentSelection,
  requireProjectUrls: boolean,
  requireProjectStackKeywords: boolean,
) {
  const context = `${label} ATS text`;
  const profileUrls = resume.basics.profiles.map((profile) =>
    stripUrlForDisplay(profile.url),
  );
  const requiredFields = [
    resume.basics.name,
    resume.basics.label ?? "Senior AI/ML Engineer",
    resume.basics.email,
    resume.basics.phone,
    `${resume.basics.location.city}, ${resume.basics.location.region}`,
    ...(variant.summary ? [variant.summary] : []),
    "Experience",
    "Skills",
    "Projects",
    "Education",
    ...profileUrls,
  ];

  for (const field of requiredFields) {
    assertStrictTextIncludes(text, field, context);
  }

  for (const job of variant.work) {
    assertStrictTextIncludes(text, job.position, context);
    assertStrictTextIncludes(text, job.name, context);
    assertStrictTextIncludes(text, job.startDate.slice(0, 4), context);

    if (job.endDate) {
      assertStrictTextIncludes(text, job.endDate.slice(0, 4), context);
    }
  }

  for (const skill of variant.skills) {
    assertStrictTextIncludes(text, `${skill.name}:`, context);
    for (const keyword of skill.keywords) {
      assertStrictTextIncludes(text, keyword, context);
    }
  }

  for (const project of variant.projects) {
    assertStrictTextIncludes(text, project.name, context);
    if (requireProjectUrls) {
      assertStrictTextIncludes(
        text,
        stripUrlForDisplay(project.githubUrl),
        context,
      );
    }
    assertStrictTextIncludes(text, project.description, context);

    if (requireProjectStackKeywords) {
      for (const keyword of project.stack ?? []) {
        assertStrictTextIncludes(text, keyword, context);
      }
    }
  }
}

async function assertAtsParseability(
  filePath: string,
  label: string,
  resume: ResumeSelection,
  variant: ResolvedVariantContentSelection,
  expectedPages: number,
) {
  await assertPdfMetadataIsAtsSafe(filePath, label, expectedPages);
  await assertPdfFontsAreAtsSafe(filePath, label);
  await assertPdfContainsNoImages(filePath, label);

  const [pdfjsText, popplerText] = await Promise.all([
    getPdfAllText(filePath),
    getPopplerText(filePath, label),
  ]);

  assertNoLetterSpacedHeadings(pdfjsText, `${label} pdfjs text`);
  assertNoLetterSpacedHeadings(popplerText.text, `${label} pdftotext text`);
  assertNoLetterSpacedHeadings(
    popplerText.layoutText,
    `${label} pdftotext layout text`,
  );
  assertContactFieldsBeforeExperience(pdfjsText, `${label} pdfjs text`, resume);
  assertContactFieldsBeforeExperience(
    popplerText.text,
    `${label} pdftotext text`,
    resume,
  );
  assertStandardAtsSectionOrder(pdfjsText, `${label} pdfjs text`, variant);
  assertStandardAtsSectionOrder(
    popplerText.text,
    `${label} pdftotext text`,
    variant,
  );
  assertLayoutAtsSectionHeadings(
    popplerText.layoutText,
    `${label} pdftotext`,
    variant,
  );
  assertRolePatternsExtractCleanly(pdfjsText, `${label} pdfjs text`, variant);
  assertRolePatternsExtractCleanly(
    popplerText.text,
    `${label} pdftotext text`,
    variant,
  );
  assertSeniorAiMlTargetKeywords(pdfjsText, `${label} pdfjs text`);
  assertSeniorAiMlTargetKeywords(popplerText.text, `${label} pdftotext text`);
  assertNoRedundantUrlLabels(pdfjsText, `${label} pdfjs text`);
  assertNoRedundantUrlLabels(popplerText.text, `${label} pdftotext text`);
  assertNoDanglingSkillSeparators(
    popplerText.layoutText,
    `${label} pdftotext layout text`,
  );
  assertArtifactContentConsistency(pdfjsText, `${label} pdfjs text`, resume, variant);
  assertArtifactContentConsistency(
    popplerText.text,
    `${label} pdftotext text`,
    resume,
    variant,
  );
  assertParseableCoreFields(
    pdfjsText,
    `${label} pdfjs text`,
    resume,
    variant,
    expectedPages > 1,
    expectedPages > 1,
  );
  assertParseableCoreFields(
    popplerText.text,
    `${label} pdftotext text`,
    resume,
    variant,
    expectedPages > 1,
    expectedPages > 1,
  );

  console.log(`✓ ${label} passes ATS parseability checks`);
}

async function assertDocxParseability(
  filePath: string,
  label: string,
  resume: ResumeSelection,
  variant: ResolvedVariantContentSelection,
  policy: DocxArtifactPolicy,
) {
  const { documentXml, relationshipsXml } = await getDocxXml(filePath, label);
  const text = extractDocxText(documentXml);

  assertNoLetterSpacedHeadings(text, `${label} DOCX text`);
  assertContactFieldsBeforeExperience(text, `${label} DOCX text`, resume);
  assertStandardAtsSectionOrder(text, `${label} DOCX text`, variant);
  assertRolePatternsExtractCleanly(text, `${label} DOCX text`, variant);
  assertSeniorAiMlTargetKeywords(text, `${label} DOCX text`);
  assertNoRedundantUrlLabels(text, `${label} DOCX text`);
  assertArtifactContentConsistency(text, `${label} DOCX text`, resume, variant);
  assertParseableCoreFields(
    text,
    `${label} DOCX text`,
    resume,
    variant,
    true,
    false,
  );

  if (variant.education.length) {
    assertStrictTextIncludes(text, "Education & Certifications", `${label} DOCX text`);
    assertNormalizedTextIncludesAll(
      text,
      variant.education,
      `${label} DOCX text`,
    );
  }

  if (variant.certificates.length) {
    assertNormalizedTextIncludesAll(
      text,
      variant.certificates,
      `${label} DOCX text`,
    );
  }

  assertDocxHyperlinkTargets(relationshipsXml, label, resume, variant);
  assertDocxPolicy(documentXml, text, label, variant, policy);
  console.log(`✓ ${label} passes DOCX parseability checks`);
}

async function assertFullResumePdf(
  filePath: string,
  label: string,
  resume: ResumeSelection,
  fullVariant: ResolvedVariantContentSelection,
) {
  const pageOne = await getPdfPageText(filePath, 1);
  const pageTwo = await getPdfPageText(filePath, 2);
  const fullText = `${pageOne.text}\n${pageTwo.text}`;
  const pageOneSkillsHeadingY = getTextItemY(
    pageOne.textItems,
    "Skills",
    `${label} page 1 layout`,
  );

  assertTextYWithinRange(
    pageOneSkillsHeadingY,
    FULL_PAGE_ONE_SKILLS_HEADING_Y_MIN,
    FULL_PAGE_ONE_SKILLS_HEADING_Y_MAX,
    `${label} page 1 Skills heading Y`,
  );
  assertTextYWithinRange(
    pageOne.lowestTextY,
    FULL_PAGE_ONE_BOTTOM_TEXT_Y_MIN,
    FULL_PAGE_ONE_BOTTOM_TEXT_Y_MAX,
    `${label} page 1 bottom text Y`,
  );

  assertNormalizedTextIncludes(
    pageOne.text,
    resume.basics.name,
    `${label} page 1`,
  );
  console.log(`✓ ${label} page 1 contains "${resume.basics.name}"`);

  assertNormalizedTextIncludes(pageOne.text, "Experience", `${label} page 1`);
  console.log(`✓ ${label} page 1 contains "Experience"`);

  assertNormalizedTextIncludesAll(
    pageOne.text,
    getSelectionNames(fullVariant.work),
    `${label} page 1`,
  );
  console.log(`✓ ${label} page 1 contains all curated work names`);

  if (fullVariant.skills?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Skills", `${label} page 1`);
    assertNormalizedTextIncludesAll(
      pageOne.text,
      getSelectionNames(fullVariant.skills),
      `${label} page 1`,
    );
    console.log(`✓ ${label} page 1 contains the curated skills section`);
  }

  assertNormalizedTextExcludes(pageOne.text, "Projects", `${label} page 1`);
  console.log(
    `✓ ${label} page 1 carries Experience and Skills before Projects`,
  );

  if (fullVariant.publications.length) {
    fail(`${label} full variant must not include Publications.`);
  }

  assertNormalizedTextExcludes(fullText, "Publications", label);
  console.log(`✓ ${label} omits Publications`);

  const expectedPageTwoSections = [
    "Projects",
    ...(fullVariant.education?.length || fullVariant.certificates?.length
      ? ["Education & Certifications"]
      : []),
  ];

  assertNormalizedTextIncludes(pageTwo.text, "Projects", `${label} page 2`);
  console.log(`✓ ${label} page 2 contains "Projects"`);

  console.log(`✓ ${label} page 2 is reserved for Projects and credentials`);

  if (fullVariant.education.length || fullVariant.certificates.length) {
    const projectsHeadingY = getTextItemY(
      pageTwo.textItems,
      "Projects",
      `${label} page 2 layout`,
    );
    const credentialsHeadingY = getTextItemY(
      pageTwo.textItems,
      "Education & Certifications",
      `${label} page 2 layout`,
    );

    if (projectsHeadingY <= credentialsHeadingY) {
      fail(
        `${label} page 2 must keep Projects above Education & Certifications; found ${projectsHeadingY.toFixed(1)}pt and ${credentialsHeadingY.toFixed(1)}pt.`,
      );
    }

    console.log(
      `✓ ${label} page 2 keeps Projects at ${projectsHeadingY.toFixed(1)}pt above Education & Certifications at ${credentialsHeadingY.toFixed(1)}pt`,
    );

    const projectHeadingYs = fullVariant.projects.map((project) =>
      getTextItemY(pageTwo.textItems, project.name, `${label} page 2 layout`),
    );

    for (let index = 0; index < projectHeadingYs.length; index += 1) {
      const projectHeadingY = projectHeadingYs[index];

      if (projectHeadingY <= credentialsHeadingY) {
        fail(
          `${label} page 2 must keep "${fullVariant.projects[index]?.name}" above Education & Certifications.`,
        );
      }
    }

    if (projectHeadingYs.length > 1) {
      const deltas = projectHeadingYs
        .slice(0, -1)
        .map((y, index) => y - projectHeadingYs[index + 1]);

      if (deltas.some((delta) => delta <= 0)) {
        fail(`${label} page 2 project headings must descend from top to bottom.`);
      }

      const deltaSpread = Math.max(...deltas) - Math.min(...deltas);
      if (deltaSpread > FULL_PAGE_TWO_PROJECT_HEADING_DELTA_SPREAD_MAX) {
        fail(
          `${label} page 2 project heading delta spread must stay <= ${FULL_PAGE_TWO_PROJECT_HEADING_DELTA_SPREAD_MAX}pt; found ${deltaSpread.toFixed(1)}pt (${deltas.map((delta) => delta.toFixed(1)).join(", ")}pt).`,
        );
      }

      console.log(
        `✓ ${label} page 2 project heading deltas are ${deltas.map((delta) => delta.toFixed(1)).join(", ")}pt (spread ${deltaSpread.toFixed(1)}pt)`,
      );
    }
  }

  if (fullVariant.education?.length) {
    assertNormalizedTextIncludes(pageTwo.text, "Education", `${label} page 2`);
    assertNormalizedTextIncludesAll(
      pageTwo.text,
      fullVariant.education,
      `${label} page 2`,
    );
    console.log(`✓ ${label} page 2 contains the curated education section`);
  }

  if (fullVariant.certificates?.length) {
    assertNormalizedTextIncludes(
      pageTwo.text,
      "Certifications",
      `${label} page 2`,
    );
    assertNormalizedTextIncludesAll(
      pageTwo.text,
      fullVariant.certificates,
      `${label} page 2`,
    );
    console.log(
      `✓ ${label} page 2 contains the curated certifications section`,
    );
  }

  assertNormalizedTextIncludesAll(
    pageTwo.text,
    getSelectionNames(fullVariant.projects),
    `${label} page 2`,
  );
  console.log(`✓ ${label} page 2 contains all curated project names`);

  assertNormalizedTextExcludes(pageTwo.text, "Tech:", `${label} page 2`);
  assertNormalizedTextExcludes(pageTwo.text, "Stack:", `${label} page 2`);
  assertNormalizedTextIncludesAll(
    pageTwo.text,
    ["FastMCP", "Pandas", "SQLAlchemy", "Playwright", "Docker", "Next.js"],
    `${label} page 2 project stack keywords`,
  );
  console.log(`✓ ${label} page 2 contains parseable project stack keywords`);

  assertNormalizedSectionOrder(
    pageTwo.text,
    expectedPageTwoSections,
    `${label} page 2`,
  );
  console.log(
    `✓ ${label} page 2 keeps ${expectedPageTwoSections.join(" → ")} in order`,
  );
}

async function assertSingleResumePdf(
  filePath: string,
  label: string,
  resume: ResumeSelection,
  singleVariant: ResolvedVariantContentSelection,
) {
  const pageOne = await getPdfPageText(filePath, 1);

  assertTextYWithinRange(
    pageOne.highestTextY,
    SINGLE_PAGE_TOP_TEXT_Y_MIN,
    SINGLE_PAGE_TOP_TEXT_Y_MAX,
    `${label} top text Y`,
  );
  assertTextYWithinRange(
    pageOne.lowestTextY,
    SINGLE_PAGE_BOTTOM_TEXT_Y_MIN,
    SINGLE_PAGE_BOTTOM_TEXT_Y_MAX,
    `${label} bottom text Y`,
  );

  assertNormalizedTextIncludes(pageOne.text, resume.basics.name, label);
  console.log(`✓ ${label} contains "${resume.basics.name}"`);

  assertNormalizedTextIncludes(pageOne.text, "Experience", label);
  console.log(`✓ ${label} contains "Experience"`);

  assertNormalizedTextIncludesAll(
    pageOne.text,
    getSelectionNames(singleVariant.work),
    label,
  );
  console.log(`✓ ${label} contains all curated work names`);

  if (singleVariant.skills?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Skills", label);
    assertNormalizedTextIncludesAll(
      pageOne.text,
      getSelectionNames(singleVariant.skills),
      label,
    );
    console.log(`✓ ${label} contains the curated skills section`);
  }

  if (singleVariant.education?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Education", label);
    assertNormalizedTextIncludesAll(
      pageOne.text,
      singleVariant.education,
      label,
    );
    console.log(`✓ ${label} contains the curated education entries`);
  }

  if (singleVariant.projects?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Projects", label);
  }

  if (singleVariant.certificates?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Certifications", label);
    assertNormalizedTextIncludesAll(
      pageOne.text,
      singleVariant.certificates,
      label,
    );
    console.log(`✓ ${label} contains the compact certifications entries`);
  }

  assertNormalizedTextIncludesAll(
    pageOne.text,
    getSelectionNames(singleVariant.projects),
    label,
  );
  console.log(`✓ ${label} contains all curated project names`);

  assertNormalizedSectionOrder(
    pageOne.text,
    ["Experience", "Skills", "Projects", "Education & Certifications"],
    label,
  );
  console.log(`✓ ${label} keeps compact sections in order`);

  assertEntriesStayWithinSection(
    pageOne.text,
    getSelectionNames(singleVariant.work),
    "Experience",
    "Skills",
    label,
  );
  console.log(
    `✓ ${label} keeps curated work entries inside the "Experience" section`,
  );

  if (singleVariant.skills?.length) {
    assertEntriesStayWithinSection(
      pageOne.text,
      getSelectionNames(singleVariant.skills),
      "Skills",
      "Projects",
      label,
    );
    console.log(
      `✓ ${label} keeps curated skill groups inside the "Skills" section`,
    );
  }

  if (singleVariant.projects?.length) {
    assertEntriesStayWithinSection(
      pageOne.text,
      getSelectionNames(singleVariant.projects),
      "Projects",
      "Education",
      label,
    );
    console.log(
      `✓ ${label} keeps curated project entries inside the "Projects" section`,
    );
  }

  if (singleVariant.education?.length) {
    assertEntriesStayWithinSection(
      pageOne.text,
      [...singleVariant.education, ...(singleVariant.certificates ?? [])],
      "Education & Certifications",
      null,
      label,
    );
    console.log(
      `✓ ${label} keeps curated education and certification entries inside the credentials section`,
    );
  }
}

async function runArtifactChecks() {
  const [resume, fullVariant, singleVariant, artifactSpecs] = await Promise.all([
    readResumeSelection(RESUME_PATH),
    readVariantSelection(FULL_VARIANT_PATH),
    readVariantSelection(SINGLE_VARIANT_PATH),
    loadArtifactSpecs(),
  ]);
  const resolvedFullVariant = resolveVariantContent(resume, fullVariant);
  const resolvedSingleVariant = resolveVariantContent(resume, singleVariant);

  for (const artifact of expectedArtifacts) {
    await assertArtifactExists(artifact);
  }

  for (const expectation of pdfExpectations) {
    await assertPdfExpectations(
      path.join(OUTPUT_DIR, expectation.fileName),
      expectation.fileName,
      expectation.expectedPages,
    );
  }

  await assertFullResumePdf(
    path.join(OUTPUT_DIR, "resume-full.pdf"),
    "resume-full.pdf",
    resume,
    resolvedFullVariant,
  );
  await assertSingleResumePdf(
    path.join(OUTPUT_DIR, "resume-single.pdf"),
    "resume-single.pdf",
    resume,
    resolvedSingleVariant,
  );
  await assertAtsParseability(
    path.join(OUTPUT_DIR, "resume-full.pdf"),
    "resume-full.pdf",
    resume,
    resolvedFullVariant,
    2,
  );
  await assertAtsParseability(
    path.join(OUTPUT_DIR, "resume-single.pdf"),
    "resume-single.pdf",
    resume,
    resolvedSingleVariant,
    1,
  );
  await assertDocxParseability(
    path.join(OUTPUT_DIR, "resume-full.docx"),
    "resume-full.docx",
    resume,
    resolvedFullVariant,
    artifactSpecs.full.docx,
  );
  await assertDocxParseability(
    path.join(OUTPUT_DIR, "resume-single.docx"),
    "resume-single.docx",
    resume,
    resolvedSingleVariant,
    artifactSpecs.single.docx,
  );

  for (const expectation of publicDownloadPdfExpectations) {
    const filePath = await assertPublicDownloadExists(expectation.fileName);
    await assertPdfExpectations(
      filePath,
      path.join("public", "downloads", expectation.fileName),
      expectation.expectedPages,
    );
  }

  for (const artifact of publicDownloadDocxArtifacts) {
    await assertPublicDownloadExists(artifact);
  }

  for (const pair of artifactParityPairs) {
    await assertMatchingArtifactHash(
      path.join(OUTPUT_DIR, pair.generatedFileName),
      path.join(PUBLIC_DOWNLOADS_DIR, pair.publicFileName),
      pair.generatedFileName,
      path.join("public", "downloads", pair.publicFileName),
    );
  }

  await assertFullResumePdf(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-full.pdf"),
    path.join("public", "downloads", "wyatt-walsh-resume-full.pdf"),
    resume,
    resolvedFullVariant,
  );
  await assertSingleResumePdf(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-single.pdf"),
    path.join("public", "downloads", "wyatt-walsh-resume-single.pdf"),
    resume,
    resolvedSingleVariant,
  );
  await assertAtsParseability(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-full.pdf"),
    path.join("public", "downloads", "wyatt-walsh-resume-full.pdf"),
    resume,
    resolvedFullVariant,
    2,
  );
  await assertAtsParseability(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-single.pdf"),
    path.join("public", "downloads", "wyatt-walsh-resume-single.pdf"),
    resume,
    resolvedSingleVariant,
    1,
  );
  await assertDocxParseability(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-full.docx"),
    path.join("public", "downloads", "wyatt-walsh-resume-full.docx"),
    resume,
    resolvedFullVariant,
    artifactSpecs.full.docx,
  );
  await assertDocxParseability(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-single.docx"),
    path.join("public", "downloads", "wyatt-walsh-resume-single.docx"),
    resume,
    resolvedSingleVariant,
    artifactSpecs.single.docx,
  );

  console.log("Artifact regression checks passed.");
}

void runArtifactChecks().catch((error: unknown) => {
  process.exitCode = 1;
  console.error("Artifact regression checks failed:", error);
});
