import fs from "node:fs";
import path from "node:path";
import {
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx";

type ResumeVariantName = "full" | "single";

interface ProfileSelection {
  network: string;
  username: string;
  url: string;
}

interface BasicsSelection {
  name: string;
  label?: string;
  email: string;
  phone: string;
  url: string;
  summary?: string;
  location: {
    city: string;
    region: string;
    countryCode: string;
  };
  profiles: ProfileSelection[];
}

interface NamedSelection {
  name: string;
}

interface WorkSelection extends NamedSelection {
  position: string;
  url?: string;
  startDate: string;
  endDate: string | null;
  location: string;
  summary?: string;
  highlights: string[];
}

interface EducationSelection {
  institution: string;
  url?: string;
  studyType: string;
  area?: string;
  score?: string;
  startDate: string;
  endDate: string;
}

interface CertificateSelection extends NamedSelection {
  issuer: string;
  date: string;
  url?: string;
}

interface PublicationSelection extends NamedSelection {
  publisher: string;
  releaseDate: string;
  url: string;
}

interface SkillSelection extends NamedSelection {
  keywords: string[];
}

interface ProjectSelection extends NamedSelection {
  description: string;
  url?: string;
  githubUrl: string;
  stack?: string[];
  startDate: string;
  endDate: string | null;
  highlights: string[];
}

interface ResumeSelection {
  basics: BasicsSelection;
  work: WorkSelection[];
  education: EducationSelection[];
  certificates?: CertificateSelection[];
  publications?: PublicationSelection[];
  skills?: SkillSelection[];
  projects?: ProjectSelection[];
}

interface BasicsOverrides {
  summary?: string | null;
  label?: string | null;
}

interface WorkVariantSelection extends NamedSelection {
  summary?: string | null;
  highlightIndexes?: number[];
}

interface ProjectVariantSelection extends NamedSelection {
  description?: string;
  highlightIndexes?: number[];
}

interface SkillVariantSelection extends NamedSelection {
  keywordIndexes?: number[];
}

interface VariantSelection {
  basics?: BasicsOverrides;
  work?: WorkVariantSelection[];
  education?: string[];
  projects?: ProjectVariantSelection[];
  skills?: SkillVariantSelection[];
  certificates?: string[];
  publications?: string[];
}

interface ResolvedResumeVariant {
  name: ResumeVariantName;
  basics: BasicsSelection;
  work: WorkSelection[];
  education: EducationSelection[];
  certificates: CertificateSelection[];
  publications: PublicationSelection[];
  skills: SkillSelection[];
  projects: ProjectSelection[];
}

interface DocxArtifact {
  name: ResumeVariantName;
  variantPath: string;
  outputName: string;
}

const RESUME_DATA_PATH = path.resolve(process.cwd(), "assets", "data", "resume.json");
const DOCX_FONT = "Arial";
const BODY_SIZE = 20;
const SMALL_SIZE = 18;
const HEADING_COLOR = "0F172A";
const MUTED_COLOR = "475569";
const LINK_COLOR = "2563EB";

const docxArtifacts: DocxArtifact[] = [
  {
    name: "full",
    variantPath: path.resolve(process.cwd(), "assets", "data", "variants", "full.json"),
    outputName: "resume-full.docx",
  },
  {
    name: "single",
    variantPath: path.resolve(process.cwd(), "assets", "data", "variants", "single.json"),
    outputName: "resume-single.docx",
  },
];

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function getByName<T extends NamedSelection>(
  items: T[] | undefined,
  name: string,
  sectionLabel: string,
) {
  const match = items?.find((item) => item.name === name);

  if (!match) {
    throw new Error(`Unknown ${sectionLabel} entry "${name}".`);
  }

  return match;
}

function pickByIndexes<T>(values: T[], indexes: number[] | undefined) {
  if (!indexes) {
    return values;
  }

  return indexes.map((index) => {
    const value = values[index];

    if (value === undefined) {
      throw new Error(`Variant index "${index}" is outside the selected content bounds.`);
    }

    return value;
  });
}

function resolveBasics(
  basics: BasicsSelection,
  overrides: BasicsOverrides | undefined,
): BasicsSelection {
  if (!overrides) {
    return basics;
  }

  return {
    ...basics,
    ...(overrides.label === undefined ? {} : { label: overrides.label ?? undefined }),
    ...(overrides.summary === undefined
      ? {}
      : { summary: overrides.summary ?? undefined }),
  };
}

function resolveVariant(
  name: ResumeVariantName,
  resume: ResumeSelection,
  variant: VariantSelection,
): ResolvedResumeVariant {
  const work = variant.work
    ? variant.work.map((selection) => {
        const baseWork = getByName(resume.work, selection.name, "work");

        return {
          ...baseWork,
          ...(selection.summary === undefined
            ? {}
            : { summary: selection.summary ?? undefined }),
          highlights: pickByIndexes(baseWork.highlights, selection.highlightIndexes),
        };
      })
    : resume.work;
  const skills = variant.skills
    ? variant.skills.map((selection) => {
        const baseSkill = getByName(resume.skills, selection.name, "skill");

        return {
          ...baseSkill,
          keywords: pickByIndexes(baseSkill.keywords, selection.keywordIndexes),
        };
      })
    : (resume.skills ?? []);
  const projects = variant.projects
    ? variant.projects.map((selection) => {
        const baseProject = getByName(resume.projects, selection.name, "project");

        return {
          ...baseProject,
          description: selection.description ?? baseProject.description,
          highlights: pickByIndexes(baseProject.highlights, selection.highlightIndexes),
        };
      })
    : (resume.projects ?? []);

  return {
    name,
    basics: resolveBasics(resume.basics, variant.basics),
    work,
    education: (variant.education ?? resume.education.map(({ institution }) => institution)).map(
      (institution) => {
        const match = resume.education.find((entry) => entry.institution === institution);

        if (!match) {
          throw new Error(`Unknown education entry "${institution}".`);
        }

        return match;
      },
    ),
    certificates: (variant.certificates ?? resume.certificates?.map(({ name: certificateName }) => certificateName) ?? []).map(
      (certificateName) => getByName(resume.certificates, certificateName, "certificate"),
    ),
    publications: (variant.publications ?? resume.publications?.map(({ name: publicationName }) => publicationName) ?? []).map(
      (publicationName) => getByName(resume.publications, publicationName, "publication"),
    ),
    skills,
    projects,
  };
}

function formatMonthYear(date: string) {
  const [year, month] = date.split("-").map(Number);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });

  if (!year || !month || month < 1 || month > 12) {
    throw new Error(`Invalid resume date "${date}".`);
  }

  return formatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatDateRange(startDate: string, endDate: string | null) {
  return `${formatMonthYear(startDate)} - ${endDate ? formatMonthYear(endDate) : "Present"}`;
}

function formatProfileDisplayUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    const pathname = parsedUrl.pathname.replace(/\/$/, "");
    return `${hostname}${pathname}`;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function textRun(
  text: string,
  options: {
    bold?: boolean;
    color?: string;
    italics?: boolean;
    size?: number;
  } = {},
) {
  return new TextRun({
    color: options.color ?? HEADING_COLOR,
    font: DOCX_FONT,
    size: options.size ?? BODY_SIZE,
    text,
    bold: options.bold,
    italics: options.italics,
  });
}

function linkRun(url: string, label: string) {
  return new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        color: LINK_COLOR,
        font: DOCX_FONT,
        size: BODY_SIZE,
        text: label,
        underline: {
          color: LINK_COLOR,
          type: UnderlineType.SINGLE,
        },
      }),
    ],
  });
}

function separatorRun() {
  return textRun(" | ", { color: MUTED_COLOR, size: SMALL_SIZE });
}

function paragraph(
  children: (TextRun | ExternalHyperlink)[],
  options: {
    after?: number;
    before?: number;
    bullet?: boolean;
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
    pageBreakBefore?: boolean;
  } = {},
) {
  return new Paragraph({
    children,
    heading: options.heading,
    pageBreakBefore: options.pageBreakBefore,
    bullet: options.bullet ? { level: 0 } : undefined,
    spacing: {
      after: options.after ?? 90,
      before: options.before,
    },
  });
}

function sectionHeading(title: string, pageBreakBefore = false) {
  return paragraph([textRun(title, { bold: true, size: 22 })], {
    after: 120,
    before: pageBreakBefore ? undefined : 170,
    heading: HeadingLevel.HEADING_2,
    pageBreakBefore,
  });
}

function itemTitle(
  title: string,
  details: (string | { href: string; label: string })[],
) {
  const children: (TextRun | ExternalHyperlink)[] = [
    textRun(title, { bold: true, size: 21 }),
  ];

  for (const detail of details) {
    children.push(separatorRun());
    if (typeof detail === "string") {
      children.push(textRun(detail, { color: MUTED_COLOR, size: SMALL_SIZE }));
    } else {
      children.push(linkRun(detail.href, detail.label));
    }
  }

  return paragraph(children, { after: 45 });
}

function addHeader(children: Paragraph[], basics: BasicsSelection) {
  children.push(
    paragraph([linkRun(basics.url, basics.name)], {
      after: 75,
      heading: HeadingLevel.TITLE,
    }),
  );

  if (basics.label) {
    children.push(paragraph([textRun(basics.label, { bold: true, size: 20 })], { after: 45 }));
  }

  children.push(
    paragraph(
      [
        linkRun(`mailto:${basics.email}`, basics.email),
        separatorRun(),
        linkRun(`tel:${basics.phone}`, basics.phone),
        separatorRun(),
        textRun(`${basics.location.city}, ${basics.location.region}`, {
          color: MUTED_COLOR,
          size: SMALL_SIZE,
        }),
        ...basics.profiles.flatMap((profile) => [
          separatorRun(),
          linkRun(profile.url, formatProfileDisplayUrl(profile.url)),
        ]),
      ],
      { after: 100 },
    ),
  );

  if (basics.summary) {
    children.push(paragraph([textRun(basics.summary, { size: BODY_SIZE })], { after: 170 }));
  }
}

function addWork(children: Paragraph[], work: WorkSelection[]) {
  children.push(sectionHeading("Experience"));

  for (const job of work) {
    children.push(
      itemTitle(job.position, [
        job.url ? { href: job.url, label: job.name } : job.name,
        job.location,
        formatDateRange(job.startDate, job.endDate),
      ]),
    );

    if (job.summary) {
      children.push(paragraph([textRun(job.summary)], { after: 50 }));
    }

    for (const highlight of job.highlights) {
      children.push(paragraph([textRun(highlight)], { after: 35, bullet: true }));
    }
  }
}

function addSkills(children: Paragraph[], skills: SkillSelection[]) {
  if (!skills.length) {
    return;
  }

  children.push(sectionHeading("Skills"));
  for (const skill of skills) {
    children.push(
      paragraph(
        [
          textRun(`${skill.name}: `, { bold: true }),
          textRun(skill.keywords.join(", ")),
        ],
        { after: 45 },
      ),
    );
  }
}

function addProjects(
  children: Paragraph[],
  projects: ProjectSelection[],
  pageBreakBefore: boolean,
) {
  if (!projects.length) {
    return;
  }

  children.push(sectionHeading("Projects", pageBreakBefore));
  for (const project of projects) {
    children.push(
      itemTitle(project.name, [
        { href: project.githubUrl, label: formatProfileDisplayUrl(project.githubUrl) },
      ]),
    );
    children.push(paragraph([textRun(project.description)], { after: 45 }));

    for (const highlight of project.highlights) {
      children.push(paragraph([textRun(highlight)], { after: 35, bullet: true }));
    }
  }
}

function addCredentials(
  children: Paragraph[],
  education: EducationSelection[],
  certificates: CertificateSelection[],
) {
  children.push(sectionHeading("Education & Certifications"));

  for (const entry of education) {
    children.push(paragraph([textRun(entry.studyType, { bold: true, size: 21 })], { after: 35 }));
    children.push(
      paragraph(
        [
          entry.url
            ? linkRun(entry.url, entry.institution)
            : textRun(entry.institution, { color: MUTED_COLOR }),
          ...(entry.area
            ? [textRun(`, ${entry.area}`, { color: MUTED_COLOR })]
            : []),
        ],
        { after: 25 },
      ),
    );
    children.push(
      paragraph([textRun(formatDateRange(entry.startDate, entry.endDate), { color: MUTED_COLOR, size: SMALL_SIZE })], {
        after: 80,
      }),
    );
  }

  for (const certificate of certificates) {
    children.push(
      paragraph(
        [
          certificate.url
            ? linkRun(certificate.url, certificate.name)
            : textRun(certificate.name, { bold: true, size: 21 }),
        ],
        { after: 35 },
      ),
    );
    children.push(
      paragraph(
        [
          textRun(certificate.issuer, { color: MUTED_COLOR, size: SMALL_SIZE }),
          separatorRun(),
          textRun(formatMonthYear(certificate.date), { color: MUTED_COLOR, size: SMALL_SIZE }),
        ],
        { after: 80 },
      ),
    );
  }
}

function addPublications(children: Paragraph[], publications: PublicationSelection[]) {
  if (!publications.length) {
    return;
  }

  children.push(sectionHeading("Publications"));
  for (const publication of publications) {
    children.push(
      itemTitle(publication.name, [
        publication.publisher,
        formatMonthYear(publication.releaseDate),
        { href: publication.url, label: formatProfileDisplayUrl(publication.url) },
      ]),
    );
  }
}

function buildDocxDocument(variant: ResolvedResumeVariant) {
  const children: Paragraph[] = [];

  addHeader(children, variant.basics);
  addWork(children, variant.work);
  addSkills(children, variant.skills);
  addProjects(children, variant.projects, variant.name === "full");
  addCredentials(children, variant.education, variant.certificates);
  addPublications(children, variant.publications);

  return new Document({
    creator: "Wyatt Walsh",
    description: `${variant.name === "single" ? "One-page" : "Two-page"} ATS-friendly resume for Wyatt Walsh.`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              bottom: 720,
              left: 720,
              right: 720,
              top: 720,
            },
          },
        },
        children,
      },
    ],
    title: `Wyatt Walsh Resume (${variant.name === "single" ? "1-page" : "2-page"})`,
  });
}

export async function generateDocxArtifacts(outputDir: string) {
  const resume = readJsonFile<ResumeSelection>(RESUME_DATA_PATH);

  for (const artifact of docxArtifacts) {
    const variantConfig = readJsonFile<VariantSelection>(artifact.variantPath);
    const variant = resolveVariant(artifact.name, resume, variantConfig);
    const document = buildDocxDocument(variant);
    const buffer = await Packer.toBuffer(document);
    const outputPath = path.join(outputDir, artifact.outputName);

    fs.writeFileSync(outputPath, buffer);
    console.log(`  -> ${artifact.outputName}`);
  }
}
