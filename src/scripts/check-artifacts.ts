import fs from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const OUTPUT_DIR = path.resolve(process.cwd(), "assets", "outputs");
const RESUME_PATH = path.resolve(process.cwd(), "assets", "data", "resume.json");
const FULL_VARIANT_PATH = path.resolve(process.cwd(), "assets", "data", "variants", "full.json");
const SINGLE_VARIANT_PATH = path.resolve(process.cwd(), "assets", "data", "variants", "single.json");
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

function fail(message: string): never {
  throw new Error(message);
}

function isWithinTolerance(value: number, expected: number) {
  return Math.abs(value - expected) <= LETTER_SIZE_TOLERANCE;
}

function normalizeLooseText(text: string) {
  return text.toLowerCase().replace(/[^a-z]+/g, "");
}

function assertNormalizedTextIncludes(haystack: string, needle: string, context: string) {
  if (!normalizeLooseText(haystack).includes(normalizeLooseText(needle))) {
    fail(`${context} must contain "${needle}".`);
  }
}

async function readVariantSelection(filePath: string): Promise<VariantContentSelection> {
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

function assertNormalizedTextIncludesAll(haystack: string, needles: string[], context: string) {
  for (const needle of needles) {
    assertNormalizedTextIncludes(haystack, needle, context);
  }
}

async function assertArtifactExists(fileName: (typeof expectedArtifacts)[number]) {
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

    return { text, normalizedText: normalizeLooseText(text) };
  } finally {
    await pdf.destroy();
  }
}

async function assertPdfExpectations({ fileName, expectedPages }: PdfExpectation) {
  const filePath = path.join(OUTPUT_DIR, fileName);
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
      fail(`${fileName} should have ${expectedPages} page(s), found ${pdf.numPages}.`);
    }

    console.log(`✓ ${fileName} has ${expectedPages} page(s)`);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });

      if (
        !isWithinTolerance(viewport.width, LETTER_WIDTH_POINTS) ||
        !isWithinTolerance(viewport.height, LETTER_HEIGHT_POINTS)
      ) {
        fail(
          `${fileName} page ${pageNumber} should be letter sized (${LETTER_WIDTH_POINTS}x${LETTER_HEIGHT_POINTS}), found ${viewport.width.toFixed(2)}x${viewport.height.toFixed(2)}.`,
        );
      }
    }

    console.log(`✓ ${fileName} uses letter-sized pages`);
  } finally {
    await pdf.destroy();
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
    await assertPdfExpectations(expectation);
  }

  const fullPageOne = await getPdfPageText(path.join(OUTPUT_DIR, "resume-full.pdf"), 1);
  const fullPageTwo = await getPdfPageText(path.join(OUTPUT_DIR, "resume-full.pdf"), 2);
  const singlePageOne = await getPdfPageText(path.join(OUTPUT_DIR, "resume-single.pdf"), 1);

  assertNormalizedTextIncludes(fullPageOne.text, resume.basics.name, "resume-full.pdf page 1");
  assertNormalizedTextIncludes(singlePageOne.text, resume.basics.name, "resume-single.pdf");
  console.log(`✓ generated PDFs contain "${resume.basics.name}"`);

  assertNormalizedTextIncludes(fullPageOne.text, "Experience", "resume-full.pdf page 1");
  console.log('✓ resume-full.pdf page 1 contains "Experience"');

  assertNormalizedTextIncludesAll(
    fullPageOne.text,
    getSelectionNames(fullVariant.work),
    "resume-full.pdf page 1",
  );
  console.log("✓ resume-full.pdf page 1 contains all curated work names");

  assertNormalizedTextIncludes(fullPageTwo.text, "Projects", "resume-full.pdf page 2");
  console.log('✓ resume-full.pdf page 2 contains "Projects"');

  if (fullVariant.skills?.length) {
    assertNormalizedTextIncludes(fullPageTwo.text, "Skills", "resume-full.pdf page 2");
    assertNormalizedTextIncludesAll(
      fullPageTwo.text,
      getSelectionNames(fullVariant.skills),
      "resume-full.pdf page 2",
    );
    console.log("✓ resume-full.pdf page 2 contains the curated skills section");
  }

  if (fullVariant.education?.length) {
    assertNormalizedTextIncludes(fullPageTwo.text, "Education", "resume-full.pdf page 2");
    assertNormalizedTextIncludesAll(fullPageTwo.text, fullVariant.education, "resume-full.pdf page 2");
    console.log("✓ resume-full.pdf page 2 contains the curated education section");
  }

  if (fullVariant.certificates?.length) {
    assertNormalizedTextIncludes(fullPageTwo.text, "Certifications", "resume-full.pdf page 2");
    assertNormalizedTextIncludesAll(
      fullPageTwo.text,
      fullVariant.certificates,
      "resume-full.pdf page 2",
    );
    console.log("✓ resume-full.pdf page 2 contains the curated certifications section");
  }

  if (fullVariant.publications?.length) {
    assertNormalizedTextIncludes(fullPageTwo.text, "Publications", "resume-full.pdf page 2");
    assertNormalizedTextIncludesAll(
      fullPageTwo.text,
      fullVariant.publications,
      "resume-full.pdf page 2",
    );
    console.log("✓ resume-full.pdf page 2 contains the curated publications section");
  }

  assertNormalizedTextIncludesAll(
    fullPageTwo.text,
    getSelectionNames(fullVariant.projects),
    "resume-full.pdf page 2",
  );

  console.log("✓ resume-full.pdf page 2 contains all curated project names");

  assertNormalizedTextIncludes(singlePageOne.text, "Experience", "resume-single.pdf");
  console.log('✓ resume-single.pdf contains "Experience"');

  assertNormalizedTextIncludesAll(
    singlePageOne.text,
    getSelectionNames(singleVariant.work),
    "resume-single.pdf",
  );
  console.log("✓ resume-single.pdf contains all curated work names");

  if (singleVariant.skills?.length) {
    assertNormalizedTextIncludes(singlePageOne.text, "Skills", "resume-single.pdf");
    assertNormalizedTextIncludesAll(
      singlePageOne.text,
      getSelectionNames(singleVariant.skills),
      "resume-single.pdf",
    );
    console.log("✓ resume-single.pdf contains the curated skills section");
  }

  if (singleVariant.education?.length) {
    assertNormalizedTextIncludes(singlePageOne.text, "Education", "resume-single.pdf");
    assertNormalizedTextIncludesAll(singlePageOne.text, singleVariant.education, "resume-single.pdf");
    console.log("✓ resume-single.pdf contains the curated education section");
  }

  if (singleVariant.projects?.length) {
    assertNormalizedTextIncludes(singlePageOne.text, "Projects", "resume-single.pdf");
  }

  assertNormalizedTextIncludesAll(
    singlePageOne.text,
    getSelectionNames(singleVariant.projects),
    "resume-single.pdf",
  );
  console.log("✓ resume-single.pdf contains all curated project names");

  console.log("Artifact regression checks passed.");
}

void runArtifactChecks().catch((error: unknown) => {
  process.exitCode = 1;
  console.error("Artifact regression checks failed:", error);
});
