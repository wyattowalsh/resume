import fs from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

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

interface ResumeSelection {
  basics: {
    name: string;
  };
}

interface VariantContentSelection {
  work?: NamedSelection[];
  projects?: NamedSelection[];
  skills?: NamedSelection[];
  education?: string[];
  certificates?: string[];
  publications?: string[];
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

function fail(message: string): never {
  throw new Error(message);
}

function isWithinTolerance(value: number, expected: number) {
  return Math.abs(value - expected) <= LETTER_SIZE_TOLERANCE;
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

async function assertFullResumePdf(
  filePath: string,
  label: string,
  resume: ResumeSelection,
  fullVariant: VariantContentSelection,
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
  singleVariant: VariantContentSelection,
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
    fullVariant,
  );
  await assertSingleResumePdf(
    path.join(OUTPUT_DIR, "resume-single.pdf"),
    "resume-single.pdf",
    resume,
    singleVariant,
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
    fullVariant,
  );
  await assertSingleResumePdf(
    path.join(PUBLIC_DOWNLOADS_DIR, "wyatt-walsh-resume-single.pdf"),
    path.join("public", "downloads", "wyatt-walsh-resume-single.pdf"),
    resume,
    singleVariant,
  );

  console.log("Artifact regression checks passed.");
}

void runArtifactChecks().catch((error: unknown) => {
  process.exitCode = 1;
  console.error("Artifact regression checks failed:", error);
});
