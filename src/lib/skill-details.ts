import skillDetailsData from "@assets/data/skill-details.json";
import skillIconsData from "@assets/data/skill-icons.json";
import { z } from "zod";

const skillDetailSchema = z.object({
  category: z.string(),
  summary: z.string(),
  resumeContext: z.string(),
  evidence: z.array(
    z.object({
      label: z.string(),
      kind: z.enum([
        "work",
        "project",
        "credential",
        "publication",
        "first-party",
      ]),
    }),
  ),
  links: z.array(
    z.object({
      label: z.string(),
      href: z.string().url(),
      kind: z.enum(["official", "docs", "source", "reference", "first-party"]),
    }),
  ),
  verification: z.object({
    status: z.enum(["verified", "needs-review", "unverified"]),
    lastCheckedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const skillIconSchema = z.object({
  category: z.string(),
  iconPath: z.string(),
  sha256: z.string(),
  source: z.enum([
    "official",
    "favicon",
    "legacy",
    "web-sourced",
    "custom",
    "devicon",
  ]),
  sourceUrl: z.string().url(),
  sourceNote: z.string().optional(),
  licenseNote: z.string().optional(),
});

const skillDetailsSchema = z.record(z.string(), skillDetailSchema);
const skillIconsSchema = z.record(z.string(), skillIconSchema);

export type SkillEvidence = z.infer<
  typeof skillDetailSchema
>["evidence"][number];
export type SkillLink = z.infer<typeof skillDetailSchema>["links"][number];
export type SkillIconDetail = {
  path: string;
  source: z.infer<typeof skillIconSchema>["source"];
  sourceUrl: string;
  sha256: string;
  semanticFit: "brand" | "ecosystem" | "conceptual" | "fallback";
};
export type SkillDetail = z.infer<typeof skillDetailSchema> & {
  icon?: SkillIconDetail;
};

const skillDetails = skillDetailsSchema.parse(skillDetailsData);
const skillIcons = skillIconsSchema.parse(skillIconsData);

const categoryContexts: Record<string, string> = {
  "AI, LLM & Agent Engineering":
    "This category covers production AI systems, agent tooling, retrieval workflows, document intelligence, and AI guardrail work represented elsewhere in the resume.",
  "AI Agent Harnesses & Coding Assistants":
    "This category covers coding-assistant surfaces, reusable skills, MCP tools, docs, and cross-runtime agent workflows represented elsewhere in the resume.",
  "Machine Learning & Data Science":
    "This category covers modeling, analytics, forecasting, anomaly detection, and data-science delivery represented elsewhere in the resume.",
  "Data Engineering, Databases & Analytics":
    "This category covers validated ETL, warehouse exports, analytics systems, and data-platform engineering represented elsewhere in the resume.",
  "Streaming, Messaging & Capital Markets Systems":
    "This category covers real-time messaging, market-data systems, and event-driven capital-markets engineering represented elsewhere in the resume.",
  "Backend, APIs & Distributed Systems":
    "This category covers typed APIs, service boundaries, SDKs, authentication flows, and distributed-system delivery represented elsewhere in the resume.",
  "Frontend, Product & Desktop Engineering":
    "This category covers React, desktop, publishing, portfolio, and product-facing interface engineering represented elsewhere in the resume.",
  "Cloud, DevOps & Observability":
    "This category covers cloud delivery, CI/CD, deployment automation, infrastructure, and production observability represented elsewhere in the resume.",
  "Testing, Quality, Security & Architecture":
    "This category covers automated verification, secure delivery, audit-aware engineering, and maintainable architecture represented elsewhere in the resume.",
  "Languages & Authoring":
    "This category covers implementation, scripting, query, markup, documentation, and technical authoring represented elsewhere in the resume.",
};

const syntheticSkillLinks: Record<string, SkillLink> = {
  "Apache Airflow": {
    label: "Docs",
    href: "https://airflow.apache.org/docs/",
    kind: "docs",
  },
  "Apache Spark": {
    label: "Docs",
    href: "https://spark.apache.org/docs/latest/",
    kind: "docs",
  },
  "Amazon Kinesis": {
    label: "Docs",
    href: "https://docs.aws.amazon.com/kinesis/",
    kind: "docs",
  },
  "AWS Athena": {
    label: "Docs",
    href: "https://docs.aws.amazon.com/athena/",
    kind: "docs",
  },
  "AWS Lambda": {
    label: "Docs",
    href: "https://docs.aws.amazon.com/lambda/",
    kind: "docs",
  },
  Bash: {
    label: "Manual",
    href: "https://www.gnu.org/software/bash/manual/bash.html",
    kind: "docs",
  },
  BigQuery: {
    label: "Docs",
    href: "https://cloud.google.com/bigquery/docs",
    kind: "docs",
  },
  "Claude Desktop": {
    label: "Support docs",
    href: "https://support.claude.com/en/articles/10065433-install-claude-desktop",
    kind: "docs",
  },
  CloudFormation: {
    label: "Docs",
    href: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html",
    kind: "docs",
  },
  CodeMirror: {
    label: "Docs",
    href: "https://codemirror.net/docs/",
    kind: "docs",
  },
  Cursor: { label: "Docs", href: "https://cursor.com/docs", kind: "docs" },
  "Cursor Agent": {
    label: "Docs",
    href: "https://cursor.com/docs/agent/overview",
    kind: "docs",
  },
  "Data Warehousing": {
    label: "Overview",
    href: "https://www.ibm.com/think/topics/data-warehouse",
    kind: "reference",
  },
  "Domain-Driven Design": {
    label: "Fowler essay",
    href: "https://martinfowler.com/bliki/DomainDrivenDesign.html",
    kind: "reference",
  },
  ECS: {
    label: "Docs",
    href: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html",
    kind: "docs",
  },
  EKS: {
    label: "Docs",
    href: "https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html",
    kind: "docs",
  },
  Formatting: {
    label: "Docs",
    href: "https://prettier.io/docs/",
    kind: "docs",
  },
  "Google Cloud Functions": {
    label: "Docs",
    href: "https://cloud.google.com/functions/docs",
    kind: "docs",
  },
  "Google Cloud Pub/Sub": {
    label: "Docs",
    href: "https://cloud.google.com/pubsub/docs",
    kind: "docs",
  },
  "Google Gemini API": {
    label: "Docs",
    href: "https://ai.google.dev/gemini-api/docs",
    kind: "docs",
  },
  "GraphQL (Apollo)": {
    label: "Docs",
    href: "https://www.apollographql.com/docs/",
    kind: "docs",
  },
  Hadoop: {
    label: "Docs",
    href: "https://hadoop.apache.org/docs/current/",
    kind: "docs",
  },
  "Hugging Face": {
    label: "Docs",
    href: "https://huggingface.co/docs",
    kind: "docs",
  },
  "Integration Testing": {
    label: "Test pyramid",
    href: "https://martinfowler.com/articles/practical-test-pyramid.html",
    kind: "reference",
  },
  LlamaIndex: {
    label: "Docs",
    href: "https://developers.llamaindex.ai/python/framework/",
    kind: "docs",
  },
  "Market Data Systems": {
    label: "FIX standards",
    href: "https://www.fixtrading.org/standards/",
    kind: "reference",
  },
  Matplotlib: {
    label: "Docs",
    href: "https://matplotlib.org/stable/index.html",
    kind: "docs",
  },
  MobX: {
    label: "Docs",
    href: "https://mobx.js.org/README.html",
    kind: "docs",
  },
  NoSQL: {
    label: "Overview",
    href: "https://www.mongodb.com/resources/basics/databases/nosql-explained",
    kind: "reference",
  },
  NotebookLM: {
    label: "Product site",
    href: "https://notebooklm.google/",
    kind: "official",
  },
  Pandera: {
    label: "Docs",
    href: "https://pandera.readthedocs.io/en/stable/",
    kind: "docs",
  },
  Playwright: {
    label: "Docs",
    href: "https://playwright.dev/docs/intro",
    kind: "docs",
  },
  Plotly: { label: "Docs", href: "https://plotly.com/python/", kind: "docs" },
  Polars: { label: "Docs", href: "https://docs.pola.rs/", kind: "docs" },
  "Prompt Engineering": {
    label: "Docs",
    href: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview",
    kind: "docs",
  },
  Pydantic: {
    label: "Docs",
    href: "https://docs.pydantic.dev/latest/",
    kind: "docs",
  },
  "Python SDKs": {
    label: "Packaging guide",
    href: "https://packaging.python.org/en/latest/tutorials/packaging-projects/",
    kind: "docs",
  },
  "Redis Pub/Sub": {
    label: "Docs",
    href: "https://redis.io/docs/latest/develop/pubsub/",
    kind: "docs",
  },
  "RESTful APIs": {
    label: "REST reference",
    href: "https://restfulapi.net/",
    kind: "reference",
  },
  "Security-Aware Development": {
    label: "OWASP guide",
    href: "https://owasp.org/www-project-developer-guide/",
    kind: "reference",
  },
  SQLAlchemy: {
    label: "Docs",
    href: "https://docs.sqlalchemy.org/en/20/",
    kind: "docs",
  },
  SQLite: {
    label: "Docs",
    href: "https://www.sqlite.org/docs.html",
    kind: "docs",
  },
  Tableau: {
    label: "Docs",
    href: "https://help.tableau.com/current/pro/desktop/en-us/default.htm",
    kind: "docs",
  },
  Tracing: {
    label: "OpenTelemetry docs",
    href: "https://opentelemetry.io/docs/concepts/signals/traces/",
    kind: "docs",
  },
  Vercel: { label: "Docs", href: "https://vercel.com/docs", kind: "docs" },
  Vitest: { label: "Docs", href: "https://vitest.dev/guide/", kind: "docs" },
};

function getIconSemanticFit(source: z.infer<typeof skillIconSchema>["source"]) {
  if (source === "official") return "brand";
  if (source === "favicon" || source === "legacy") return "brand";
  if (source === "devicon" || source === "web-sourced") return "ecosystem";
  if (source === "custom") return "conceptual";
  return "conceptual";
}

export function getSkillDetail(
  skillName: string,
  category: string,
): SkillDetail | undefined {
  const detail = skillDetails[skillName];

  if (!detail) {
    return getSyntheticSkillDetail(skillName, category);
  }

  return {
    ...detail,
    category: detail.category || category,
    icon: getSkillIcon(skillName),
  };
}

function getSyntheticSkillDetail(
  skillName: string,
  category: string,
): SkillDetail | undefined {
  const icon = getSkillIcon(skillName);

  if (!icon) {
    return undefined;
  }

  return {
    category,
    summary: `${skillName} is listed under ${category} on the public resume.`,
    resumeContext:
      categoryContexts[category] ??
      "This popup has category-level context only; no skill-specific resume evidence is curated yet.",
    evidence: [{ label: category, kind: "first-party" }],
    links: [
      syntheticSkillLinks[skillName] ?? {
        label: "Icon source",
        href: icon.sourceUrl,
        kind: "source",
      },
    ],
    verification: { status: "verified", lastCheckedAt: "2026-05-08" },
    icon,
  };
}

export function getSkillIcon(skillName: string): SkillIconDetail | undefined {
  const icon = skillIcons[skillName];

  if (!icon) {
    return undefined;
  }

  return {
    path: icon.iconPath,
    source: icon.source,
    sourceUrl: icon.sourceUrl,
    sha256: icon.sha256,
    semanticFit: getIconSemanticFit(icon.source),
  };
}

export function getSkillDetails() {
  return skillDetails;
}
