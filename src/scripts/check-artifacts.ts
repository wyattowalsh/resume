import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

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
const LETTER_WIDTH_POINTS = 612;
const LETTER_HEIGHT_POINTS = 792;
const LETTER_SIZE_TOLERANCE = 1;
const MAX_ARTIFACT_AGE_MS = 15 * 60 * 1_000;

interface PdfExpectation {
  fileName: string;
  expectedPages: number;
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
  highlights: string[];
}

interface SkillSelection extends NamedSelection {
  keywords: string[];
}

interface ProjectSelection extends NamedSelection {
  description: string;
  githubUrl: string;
  highlights: string[];
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
}

interface VariantContentSelection {
  work?: WorkVariantSelection[];
  projects?: ProjectVariantSelection[];
  skills?: SkillVariantSelection[];
  education?: string[];
  certificates?: string[];
  publications?: string[];
}

interface ResolvedVariantContentSelection {
  work: WorkSelection[];
  projects: ProjectSelection[];
  skills: SkillSelection[];
  education: string[];
  certificates: string[];
  publications: string[];
}

const expectedArtifacts = [
  "resume-full.pdf",
  "resume-full.png",
  "resume-single.pdf",
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

async function runRequiredCli(command: string, args: string[], context: string) {
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
    .map((word) => word.split("").map((char) => escapeRegExp(char)).join("\\s*"))
    .join("[^a-z0-9]+");
}

function findNormalizedIndex(
  haystack: string,
  needle: string,
  fromIndex = 0,
) {
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
    work: (variant.work ?? resume.work).map((selection) => {
      const baseWork = getByName(resume.work, selection.name, "work");

      return {
        ...baseWork,
        highlights: pickByIndexes(
          baseWork.highlights,
          "highlightIndexes" in selection ? selection.highlightIndexes : undefined,
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
        highlights: pickByIndexes(
          baseProject.highlights,
          "highlightIndexes" in selection ? selection.highlightIndexes : undefined,
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
      fail(
        `${context} must keep "${needle}" after "${previousNeedle}".`,
      );
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

function getExpectedAtsSections(
  variant: ResolvedVariantContentSelection,
  expectedPages: number,
) {
  const expectedSections =
    expectedPages === 1
      ? ["Summary:", "Experience", "Skills", "Projects", "Education"]
      : ["Summary:", "Experience", "Projects", "Skills", "Education"];

  if (variant.certificates.length) {
    expectedSections.push("Certifications");
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
  expectedPages: number,
) {
  const expectedSections = getExpectedAtsSections(variant, expectedPages);

  assertNormalizedSectionOrder(text, expectedSections, `${label} section order`);
}

function findLayoutSectionHeadingIndex(
  text: string,
  sectionName: string,
  fromIndex = 0,
) {
  const heading = sectionName.replace(/:$/, "");
  const matcher = new RegExp(
    `(^|\\n)\\s*${escapeRegExp(heading)}:?\\b`,
    "i",
  );
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
  expectedPages: number,
) {
  const context = `${label} layout section headings`;
  const expectedSections = getExpectedAtsSections(variant, expectedPages);
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
    const positionIndex = getNormalizedIndex(text, job.position, context, searchFrom);
    const companyIndex = getNormalizedIndex(text, job.name, context, positionIndex);
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

    searchFrom = endDateIndex + formatAtsMonthYear(job.endDate ?? job.startDate).length;
  }
}

function assertSeniorAiMlTargetKeywords(text: string, label: string) {
  for (const keyword of seniorAiMlTargetKeywords) {
    assertStrictTextIncludes(text, keyword, `${label} target keywords`);
  }
}

function assertNoRedundantUrlLabels(text: string, label: string) {
  const redundantUrlLabel = /\b(?:LinkedIn|GitHub):\s*(?:linkedin\.com|github\.com)\//i;

  if (redundantUrlLabel.test(text)) {
    fail(`${label} must use bare profile and project URLs without redundant labels.`);
  }
}

function assertNoDanglingSkillSeparators(text: string, label: string) {
  const context = `${label} Skills section`;
  const skillsIndex = findLayoutSectionHeadingIndex(text, "Skills");

  if (skillsIndex === -1) {
    fail(`${context} must contain a standalone Skills heading.`);
  }

  const nextSectionIndexes = ["Projects", "Education", "Certifications", "Publications"]
    .map((sectionName) =>
      findLayoutSectionHeadingIndex(text, sectionName, skillsIndex + "Skills".length),
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

    fail(`Unable to inspect public download ${fileName}: ${typedError.message}`);
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

async function getPdfPageText(
  filePath: string,
  pageNumber: number,
): Promise<{ text: string; normalizedText: string }> {
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

    return { text, normalizedText: text };
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
    }

    console.log(`✓ ${label} uses letter-sized pages`);
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
    .filter((line) => line && !line.startsWith("name") && !line.startsWith("-"));

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
  const imageTable = await runRequiredCli("pdfimages", ["-list", filePath], label);
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
    "Summary:",
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
  assertNoLetterSpacedHeadings(popplerText.layoutText, `${label} pdftotext layout text`);
  assertContactFieldsBeforeExperience(pdfjsText, `${label} pdfjs text`, resume);
  assertContactFieldsBeforeExperience(
    popplerText.text,
    `${label} pdftotext text`,
    resume,
  );
  assertStandardAtsSectionOrder(
    pdfjsText,
    `${label} pdfjs text`,
    variant,
    expectedPages,
  );
  assertStandardAtsSectionOrder(
    popplerText.text,
    `${label} pdftotext text`,
    variant,
    expectedPages,
  );
  assertLayoutAtsSectionHeadings(
    popplerText.layoutText,
    `${label} pdftotext`,
    variant,
    expectedPages,
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
  assertParseableCoreFields(
    pdfjsText,
    `${label} pdfjs text`,
    resume,
    variant,
    expectedPages > 1,
  );
  assertParseableCoreFields(
    popplerText.text,
    `${label} pdftotext text`,
    resume,
    variant,
    expectedPages > 1,
  );

  console.log(`✓ ${label} passes ATS parseability checks`);
}

async function assertFullResumePdf(
  filePath: string,
  label: string,
  resume: ResumeSelection,
  fullVariant: ResolvedVariantContentSelection,
) {
  const pageOne = await getPdfPageText(filePath, 1);
  const pageTwo = await getPdfPageText(filePath, 2);

  assertNormalizedTextIncludes(pageOne.text, resume.basics.name, `${label} page 1`);
  console.log(`✓ ${label} page 1 contains "${resume.basics.name}"`);

  assertNormalizedTextIncludes(pageOne.text, "Experience", `${label} page 1`);
  console.log(`✓ ${label} page 1 contains "Experience"`);

  assertNormalizedTextIncludesAll(
    pageOne.text,
    getSelectionNames(fullVariant.work),
    `${label} page 1`,
  );
  console.log(`✓ ${label} page 1 contains all curated work names`);

  assertNormalizedTextIncludes(pageTwo.text, "Projects", `${label} page 2`);
  console.log(`✓ ${label} page 2 contains "Projects"`);

  if (fullVariant.skills?.length) {
    assertNormalizedTextIncludes(pageTwo.text, "Skills", `${label} page 2`);
    assertNormalizedTextIncludesAll(
      pageTwo.text,
      getSelectionNames(fullVariant.skills),
      `${label} page 2`,
    );
    console.log(`✓ ${label} page 2 contains the curated skills section`);
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
    console.log(`✓ ${label} page 2 contains the curated certifications section`);
  }

  if (fullVariant.publications?.length) {
    assertNormalizedTextIncludes(
      pageTwo.text,
      "Publications",
      `${label} page 2`,
    );
    assertNormalizedTextIncludesAll(
      pageTwo.text,
      fullVariant.publications,
      `${label} page 2`,
    );
    console.log(`✓ ${label} page 2 contains the curated publications section`);
  }

  assertNormalizedTextIncludesAll(
    pageTwo.text,
    getSelectionNames(fullVariant.projects),
    `${label} page 2`,
  );
  console.log(`✓ ${label} page 2 contains all curated project names`);

  const expectedPageTwoSections = [
    "Projects",
    ...(fullVariant.skills?.length ? ["Skills"] : []),
    ...(fullVariant.education?.length ? ["Education"] : []),
    ...(fullVariant.certificates?.length ? ["Certifications"] : []),
    ...(fullVariant.publications?.length ? ["Publications"] : []),
  ];

  assertNormalizedSectionOrder(pageTwo.text, expectedPageTwoSections, `${label} page 2`);
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
    assertNormalizedTextIncludesAll(pageOne.text, singleVariant.education, label);
    console.log(`✓ ${label} contains the curated education section`);
  }

  if (singleVariant.projects?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Projects", label);
  }

  if (singleVariant.certificates?.length) {
    assertNormalizedTextIncludes(pageOne.text, "Certifications", label);
    assertNormalizedTextIncludesAll(pageOne.text, singleVariant.certificates, label);
    console.log(`✓ ${label} contains the compact certifications strip`);
  }

  assertNormalizedTextIncludesAll(
    pageOne.text,
    getSelectionNames(singleVariant.projects),
    label,
  );
  console.log(`✓ ${label} contains all curated project names`);

  assertNormalizedSectionOrder(
    pageOne.text,
    ["Experience", "Skills", "Projects", "Education"],
    label,
  );
  console.log(`✓ ${label} keeps Experience → Skills → Projects → Education in order`);

  assertEntriesStayWithinSection(
    pageOne.text,
    getSelectionNames(singleVariant.work),
    "Experience",
    "Skills",
    label,
  );
  console.log(`✓ ${label} keeps curated work entries inside the "Experience" section`);

  if (singleVariant.skills?.length) {
    assertEntriesStayWithinSection(
        pageOne.text,
      getSelectionNames(singleVariant.skills),
      "Skills",
      "Projects",
      label,
    );
    console.log(`✓ ${label} keeps curated skill groups inside the "Skills" section`);
  }

  if (singleVariant.projects?.length) {
    assertEntriesStayWithinSection(
        pageOne.text,
      getSelectionNames(singleVariant.projects),
      "Projects",
      "Education",
      label,
    );
    console.log(`✓ ${label} keeps curated project entries inside the "Projects" section`);
  }

  if (singleVariant.education?.length) {
    assertEntriesStayWithinSection(
        pageOne.text,
      singleVariant.education,
      "Education",
      null,
      label,
    );
    console.log(`✓ ${label} keeps curated education entries inside the "Education" section`);
  }
}

async function runArtifactChecks() {
  const [resume, fullVariant, singleVariant] = await Promise.all([
    readResumeSelection(RESUME_PATH),
    readVariantSelection(FULL_VARIANT_PATH),
    readVariantSelection(SINGLE_VARIANT_PATH),
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

  for (const expectation of publicDownloadPdfExpectations) {
    const filePath = await assertPublicDownloadExists(expectation.fileName);
    await assertPdfExpectations(
      filePath,
      path.join("public", "downloads", expectation.fileName),
      expectation.expectedPages,
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

  console.log("Artifact regression checks passed.");
}

void runArtifactChecks().catch((error: unknown) => {
  process.exitCode = 1;
  console.error("Artifact regression checks failed:", error);
});
