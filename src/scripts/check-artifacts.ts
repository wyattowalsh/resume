import fs from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const OUTPUT_DIR = path.resolve(process.cwd(), "assets", "outputs");
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

interface VariantContentSelection {
  work?: Array<{ name: string }>;
  projects?: Array<{ name: string }>;
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
  const [fullVariant, singleVariant] = await Promise.all([
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

  const firstFullWork = fullVariant.work?.[0]?.name;
  if (firstFullWork) {
    assertNormalizedTextIncludes(fullPageOne.text, firstFullWork, "resume-full.pdf page 1");
    console.log(`✓ resume-full.pdf page 1 contains "${firstFullWork}"`);
  }

  if (!/\bprojects\b/i.test(fullPageTwo.text) && !fullPageTwo.normalizedText.includes("projects")) {
    fail('resume-full.pdf page 2 must contain "Projects".');
  }

  console.log('✓ resume-full.pdf page 2 contains "Projects"');

  for (const project of fullVariant.projects ?? []) {
    assertNormalizedTextIncludes(fullPageTwo.text, project.name, "resume-full.pdf page 2");
  }

  console.log("✓ resume-full.pdf page 2 contains all curated project names");

  for (const project of singleVariant.projects ?? []) {
    assertNormalizedTextIncludes(singlePageOne.text, project.name, "resume-single.pdf");
  }

  console.log("✓ resume-single.pdf contains all curated project names");
  console.log("Artifact regression checks passed.");
}

void runArtifactChecks().catch((error: unknown) => {
  process.exitCode = 1;
  console.error("Artifact regression checks failed:", error);
});
