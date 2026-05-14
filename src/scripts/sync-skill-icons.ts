import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const projectRoot = process.cwd();
const siteVariantPath = path.join(
  projectRoot,
  "assets/data/variants/site.json",
);
const skillDetailsPath = path.join(
  projectRoot,
  "assets/data/skill-details.json",
);
const manifestPath = path.join(projectRoot, "assets/data/skill-icons.json");
const iconOutputDir = path.join(projectRoot, "public/skill-icons");
const tempIconOutputDir = path.join(
  projectRoot,
  "public",
  `.skill-icons-${process.pid}`,
);

const requestTimeoutMs = 6_000;

const siteVariantSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      keywords: z.array(z.string()),
    }),
  ),
});

const skillDetailSchema = z.object({
  desc: z.string().trim().min(60).max(320),
  icon: z.string().startsWith("/skill-icons/"),
  links: z.array(
    z.object({
      label: z.string().trim().min(1).max(40),
      href: z.string().url().startsWith("https://"),
    }),
  ).min(1),
  name: z.string().trim().min(1).max(80),
});

const skillDetailsSchema = z.record(z.string(), skillDetailSchema);

const iconSourceSchema = z.enum([
  "official",
  "favicon",
  "legacy",
  "web-sourced",
  "custom",
  "devicon",
]);

const iconManifestEntrySchema = z.object({
  category: z.string(),
  iconName: z.string().optional(),
  iconPath: z.string().startsWith("/skill-icons/"),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  source: iconSourceSchema,
  sourceUrl: z.string().url(),
  sourceNote: z.string().optional(),
  licenseNote: z.string().optional(),
});

const iconManifestSchema = z.record(z.string(), iconManifestEntrySchema);

type IconManifest = z.infer<typeof iconManifestSchema>;
type IconSource = z.infer<typeof iconManifestEntrySchema>;
type SiteVariant = z.infer<typeof siteVariantSchema>;
type SkillDetails = z.infer<typeof skillDetailsSchema>;
type VisibleSkill = { category: string; skillName: string };
type CuratedIconCandidate = {
  iconName?: string;
  source: IconSource["source"];
  sourceNote?: string;
  licenseNote?: string;
  url: string;
};
type DownloadedIcon = Omit<
  IconSource,
  "category" | "iconPath" | "sha256" | "sourceUrl"
> & {
  bytes: Buffer;
  extension: string;
  sourceUrl: string;
};

const officialIconOverrides: Record<string, string[]> = {};

const originalLogoCandidates: Record<string, CuratedIconCandidate[]> = {
  "Apache Airflow": [deviconIcon("apacheairflow")],
  "Apache Kafka": [deviconIcon("apachekafka")],
  "Apache Spark": [deviconIcon("apachespark")],
  AMPS: [
    faviconIcon("amps-favicon", "https://crankuptheamps.com/img/favicon.ico"),
  ],
  "Amazon Bedrock": [
    awsIcon("amazon-bedrock", "ArtificialIntelligence/Bedrock.png"),
  ],
  "Amazon Kinesis": [awsIcon("amazon-kinesis", "Analytics/Kinesis.png")],
  AWS: [deviconIcon("amazonwebservices", "original-wordmark")],
  "AWS Athena": [awsIcon("aws-athena", "Analytics/Athena.png")],
  "AWS Glue": [awsIcon("aws-glue", "Analytics/Glue.png")],
  "AWS Lambda": [awsIcon("aws-lambda", "Compute/Lambda.png")],
  Azure: [deviconIcon("azure")],
  Bash: [deviconIcon("bash")],
  CloudFormation: [
    awsIcon("cloudformation", "ManagementGovernance/CloudFormation.png"),
  ],
  "C++": [
    officialIcon("isocpp", "https://isocpp.org/assets/images/cpp_logo.png"),
  ],
  DynamoDB: [awsIcon("dynamodb", "Database/DynamoDB.png")],
  DuckDB: [deviconIcon("duckdb")],
  ECS: [awsIcon("ecs", "Containers/ElasticContainerService.png")],
  EKS: [awsIcon("eks", "Containers/ElasticKubernetesService.png")],
  FastAPI: [deviconIcon("fastapi")],
  GCP: [deviconIcon("googlecloud")],
  "GitHub Actions": [simpleIcon("githubactions")],
  Go: [deviconIcon("go")],
  "Google Cloud Pub/Sub": [simpleIcon("googlepubsub")],
  Grafana: [deviconIcon("grafana")],
  "GraphQL (Apollo)": [
    deviconIcon("apollographql"),
    deviconIcon("graphql", "plain"),
  ],
  Hadoop: [simpleIcon("apachehadoop")],
  "Integration Testing": [openMojiIcon("nut-and-bolt", "1F529")],
  Java: [
    legacyIcon(
      "java-classic",
      "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Java_programming_language_logo.svg/120px-Java_programming_language_logo.svg.png",
    ),
  ],
  Jenkins: [
    officialIcon(
      "jenkins-butler",
      "https://www.jenkins.io/images/logos/jenkins/jenkins.svg",
    ),
  ],
  "KDB+": [simpleIcon("kx")],
  LangChain: [simpleIcon("langchain")],
  LangGraph: [simpleIcon("langgraph")],
  Matplotlib: [deviconIcon("matplotlib")],
  MATLAB: [
    legacyIcon(
      "matlab-classic",
      "https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png",
    ),
  ],
  "Model Context Protocol (MCP)": [simpleIcon("modelcontextprotocol")],
  MobX: [deviconIcon("mobx")],
  "Next.js": [deviconIcon("nextjs")],
  Playwright: [deviconIcon("playwright")],
  Plotly: [deviconIcon("plotly")],
  PostgreSQL: [deviconIcon("postgresql")],
  "Perplexity Desktop": [simpleIcon("perplexity")],
  Prometheus: [deviconIcon("prometheus")],
  Puppeteer: [deviconIcon("puppeteer")],
  Python: [
    webSourcedIcon("python", "https://docs.python.org/3/_static/py.svg"),
  ],
  Pandera: [
    faviconIcon(
      "pandera-favicon",
      "https://pandera.readthedocs.io/en/stable/_static/pandera-favicon.png",
    ),
  ],
  React: [deviconIcon("react")],
  Redshift: [awsIcon("redshift", "Analytics/Redshift.png")],
  "Redis Pub/Sub": [deviconIcon("redis")],
  R: [officialIcon("r-logo", "https://www.r-project.org/logo/Rlogo.svg")],
  Rust: [
    officialIcon(
      "rust-official",
      "https://www.rust-lang.org/static/images/rust-logo-blk.svg",
    ),
  ],
  SQLite: [deviconIcon("sqlite")],
  SQLAlchemy: [deviconIcon("sqlalchemy")],
  SPARQL: [simpleIcon("semanticweb")],
  "Tailwind CSS": [deviconIcon("tailwindcss")],
  Terraform: [deviconIcon("terraform")],
  Tracing: [simpleIcon("opentelemetry")],
  TypeScript: [deviconIcon("typescript")],
  Vercel: [deviconIcon("vercel")],
  "Vercel AI SDK": [simpleIcon("vercel")],
  Vitest: [deviconIcon("vitest")],
  WebSockets: [simpleIcon("socketdotio")],
  XGBoost: [
    faviconIcon(
      "xgboost-dmlc-logo",
      "https://xgboost.ai/images/logo/dmlc-logo-square.png",
    ),
  ],
  CodeMirror: [simpleIcon("codemirror")],
  "shadcn/ui": [simpleIcon("shadcnui")],
};

const curatedIconCandidates: Record<string, CuratedIconCandidate[]> = {
  "Anthropic Claude API": [simpleIcon("anthropic")],
  "OpenAI API": [
    webSourcedIcon(
      "openai",
      "https://upload.wikimedia.org/wikipedia/commons/6/66/OpenAI_logo_2025_%28symbol%29.svg",
    ),
  ],
  "Google Gemini API": [simpleIcon("googlegemini")],
  "Hugging Face": [simpleIcon("huggingface")],
  LangSmith: [
    faviconIcon("langsmith", "https://smith.langchain.com/favicon.ico"),
  ],
  PydanticAI: [simpleIcon("pydanticai", "pydantic", "0B2C4A")],
  LlamaIndex: [
    faviconIcon("llamaindex", "https://developers.llamaindex.ai/favicon.svg"),
  ],
  "Prompt Engineering": [openMojiIcon("keyboard", "2328")],
  NotebookLM: [
    simpleIcon("notebooklm"),
    faviconIcon("notebooklm", "https://notebooklm.google/favicon.ico"),
  ],
  ChatGPT: [
    webSourcedIcon(
      "chatgpt",
      "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    ),
  ],
  "Claude Desktop": [
    faviconIcon("claude-desktop", "https://claude.ai/favicon.ico"),
  ],
  "Claude Code": [
    simpleIcon("claude"),
    faviconIcon("claude-code", "https://claude.ai/favicon.ico"),
  ],
  "GitHub Copilot Web": [
    simpleIcon("githubcopilot"),
    deviconIcon("github"),
    openMojiIcon("robot", "1F916"),
  ],
  "GitHub Copilot CLI": [
    deviconIcon("github"),
    openMojiIcon("terminal", "1F5A5"),
  ],
  "Gemini CLI": [
    openMojiIcon("gem", "1F48E"),
    openMojiIcon("terminal", "1F5A5"),
  ],
  Antigravity: [
    faviconIcon("antigravity", "https://antigravity.google/favicon.ico"),
    openMojiIcon("rocket", "1F680"),
  ],
  "Perplexity Desktop": [
    simpleIcon("perplexity"),
    openMojiIcon("compass", "1F9ED"),
  ],
  "Cherry Studio": [openMojiIcon("cherry-blossom", "1F338")],
  Cursor: [
    simpleIcon("cursor"),
    faviconIcon("cursor", "https://cursor.com/favicon.ico"),
  ],
  "Cursor Agent": [
    simpleIcon("cursor"),
    faviconIcon("cursor-agent", "https://cursor.com/favicon.ico"),
  ],

  DeepAgents: [openMojiIcon("robot", "1F916")],
  "Retrieval Augmented Generation (RAG)": [openMojiIcon("books", "1F4DA")],
  "LLM Evaluation": [openMojiIcon("check-mark", "2705")],
  "AI Guardrails": [openMojiIcon("shield", "1F6E1")],
  "Semantic Retrieval": [openMojiIcon("magnifying-glass", "1F50D")],
  "Document AI": [openMojiIcon("document", "1F4C4")],
  "Knowledge Graphs": [openMojiIcon("linked-paperclips", "1F587")],

  "scikit-learn": [deviconIcon("scikitlearn")],
  PyTorch: [deviconIcon("pytorch")],
  TensorFlow: [deviconIcon("tensorflow")],
  XGBoost: [openMojiIcon("deciduous-tree", "1F333")],
  NumPy: [deviconIcon("numpy")],
  Pandas: [deviconIcon("pandas")],
  "Statistical Modeling": [openMojiIcon("bar-chart", "1F4CA")],
  "Anomaly Detection": [openMojiIcon("warning", "26A0")],
  "Time-Series Forecasting": [openMojiIcon("chart-increasing", "1F4C8")],
  "Regularized Regression": [openMojiIcon("straight-ruler", "1F4CF")],
  "Coordinate Descent": [openMojiIcon("down-arrow", "2B07")],
  "Feature Engineering": [openMojiIcon("hammer-and-wrench", "1F6E0")],
  "Model Evaluation": [openMojiIcon("balance-scale", "2696")],
  Jupyter: [deviconIcon("jupyter")],

  SQL: [deviconIcon("postgresql"), openMojiIcon("file-cabinet", "1F5C4")],
  qPython: [deviconIcon("python")],
  DynamoDB: [openMojiIcon("card-file-box", "1F5C3")],
  BigQuery: [
    simpleIcon("googlebigquery"),
    openMojiIcon("magnifying-glass", "1F50D"),
  ],
  Redshift: [openMojiIcon("warehouse", "1F3ED")],
  "AWS Athena": [openMojiIcon("telescope", "1F52D")],
  "AWS Glue": [openMojiIcon("link", "1F517")],
  Prefect: [simpleIcon("prefect"), openMojiIcon("route", "1F5FA")],
  Polars: [simpleIcon("polars")],
  Pydantic: [simpleIcon("pydantic")],
  Parquet: [simpleIcon("apacheparquet"), openMojiIcon("package", "1F4E6")],
  ETL: [openMojiIcon("repeat-button", "1F501")],
  "Data Validation": [openMojiIcon("check-box", "2611")],
  "Data Warehousing": [openMojiIcon("factory", "1F3ED")],
  NoSQL: [openMojiIcon("card-file-box", "1F5C3")],
  Tableau: [
    faviconIcon(
      "tableau",
      "https://www.tableau.com/themes/custom/tableau_www/favicon.ico",
    ),
  ],
  Dash: [deviconIcon("plotly"), openMojiIcon("speedometer", "1F3CE")],

  "Publish/Subscribe Architecture": [openMojiIcon("antenna-bars", "1F4F6")],
  "Amazon Kinesis": [openMojiIcon("water-wave", "1F30A")],
  "Event-Driven Architecture": [openMojiIcon("satellite-antenna", "1F4E1")],
  "Market Data Systems": [openMojiIcon("stock-chart", "1F4C8")],
  "Low-Latency Messaging": [openMojiIcon("stopwatch", "23F1")],
  "Content-Based Filtering": [openMojiIcon("funnel", "1F5DC")],
  "Real-Time Data Processing": [openMojiIcon("high-voltage", "26A1")],
  WebSockets: [openMojiIcon("left-right-arrow", "2194")],

  Django: [deviconIcon("django", "plain")],
  Flask: [deviconIcon("flask")],
  "Node.js": [deviconIcon("nodejs")],
  "Express.js": [deviconIcon("express")],
  "RESTful APIs": [openMojiIcon("link", "1F517")],
  "Python SDKs": [deviconIcon("python")],
  "CLI Tooling": [deviconIcon("bash"), openMojiIcon("keyboard", "2328")],
  gRPC: [deviconIcon("grpc")],
  Microservices: [openMojiIcon("puzzle-piece", "1F9E9")],
  "Serverless Architecture": [openMojiIcon("cloud", "2601")],
  "OAuth 2.0": [openMojiIcon("key", "1F511")],
  "OpenID Connect": [
    simpleIcon("openid"),
    openMojiIcon("identification-card", "1FAAA"),
  ],

  "Next.js": [deviconIcon("nextjs")],
  Vite: [deviconIcon("vitejs")],
  "Material UI": [deviconIcon("materialui")],
  "Ant Design": [deviconIcon("antdesign")],
  "Chakra UI": [deviconIcon("chakraui")],
  Redux: [deviconIcon("redux")],
  MDX: [simpleIcon("mdx"), openMojiIcon("memo", "1F4DD")],
  Electron: [deviconIcon("electron")],
  CodeMirror: [
    faviconIcon("codemirror", "https://codemirror.net/favicon.ico"),
    openMojiIcon("memo", "1F4DD"),
  ],
  Canvas: [openMojiIcon("artist-palette", "1F3A8")],
  "Web Workers": [openMojiIcon("gear", "2699")],
  Hugo: [deviconIcon("hugo")],

  GCP: [openMojiIcon("cloud", "2601")],
  Azure: [openMojiIcon("cloud", "2601")],
  Docker: [deviconIcon("docker")],
  Kubernetes: [deviconIcon("kubernetes")],
  CloudFormation: [openMojiIcon("bricks", "1F9F1")],
  Helm: [deviconIcon("helm")],
  "Argo CD": [deviconIcon("argocd")],
  Jenkins: [deviconIcon("jenkins")],
  CircleCI: [deviconIcon("circleci", "plain")],
  "AWS Lambda": [openMojiIcon("electric-plug", "1F50C")],
  "Google Cloud Functions": [
    simpleIcon("googlecloudfunctions", "googlecloud", "4285F4"),
    openMojiIcon("cloud", "2601"),
  ],
  ECS: [openMojiIcon("delivery-truck", "1F69A")],
  EKS: [
    simpleIcon("eks", "kubernetes", "FF9900"),
    openMojiIcon("package", "1F4E6"),
  ],
  Netlify: [deviconIcon("netlify")],
  Monitoring: [openMojiIcon("heart-pulse", "1FAC0")],
  Tracing: [openMojiIcon("world-map", "1F5FA")],
  "Structured Logging": [openMojiIcon("ledger", "1F4D2")],
  "CI/CD": [openMojiIcon("counterclockwise-arrows", "1F504")],

  Pytest: [deviconIcon("pytest")],
  Jest: [deviconIcon("jest", "plain")],
  Cypress: [deviconIcon("cypressio")],
  "Test-Driven Development": [openMojiIcon("test-tube", "1F9EA")],
  "Unit Testing": [openMojiIcon("microscope", "1F52C")],
  "Integration Testing": [openMojiIcon("puzzle-piece", "1F9E9")],
  "End-to-End Testing": [openMojiIcon("railway-track", "1F6E4")],
  Linting: [openMojiIcon("broom", "1F9F9")],
  Formatting: [simpleIcon("prettier"), openMojiIcon("paintbrush", "1F58C")],
  "Domain-Driven Design": [openMojiIcon("compass", "1F9ED")],
  "Security-Aware Development": [
    simpleIcon("owasp"),
    openMojiIcon("locked", "1F510"),
  ],
  Auditability: [openMojiIcon("clipboard", "1F4CB")],
  "Human-in-the-Loop Review": [openMojiIcon("handshake", "1F91D")],

  JavaScript: [deviconIcon("javascript")],
  Go: [deviconIcon("go")],
  Rust: [deviconIcon("rust", "original")],
  Java: [deviconIcon("java")],
  "C++": [deviconIcon("cplusplus")],
  q: [faviconIcon("q", "https://code.kx.com/q/local/favicon.ico")],
  R: [deviconIcon("r"), openMojiIcon("bar-chart", "1F4CA")],
  SPARQL: [openMojiIcon("linked-paperclips", "1F587")],
  MATLAB: [deviconIcon("matlab"), openMojiIcon("abacus", "1F9EE")],
  Swift: [deviconIcon("swift")],
  Bash: [simpleIcon("gnubash"), deviconIcon("bash")],
  HTML5: [deviconIcon("html5")],
  CSS3: [deviconIcon("css3")],
  Markdown: [deviconIcon("markdown")],
  LaTeX: [deviconIcon("latex")],
  YAML: [deviconIcon("yaml"), openMojiIcon("page-facing-up", "1F4C4")],
};

function faviconIcon(iconName: string, url: string): CuratedIconCandidate {
  return {
    iconName,
    source: "favicon",
    sourceNote:
      "Source-traced favicon or product icon resolved from a first-party product surface.",
    url,
  };
}

function webSourcedIcon(iconName: string, url: string): CuratedIconCandidate {
  return {
    iconName,
    source: "web-sourced",
    sourceNote:
      "Source-traced public icon asset; validated by the sync script before use.",
    url,
  };
}

function officialIcon(iconName: string, url: string): CuratedIconCandidate {
  return {
    iconName,
    source: "official",
    sourceNote:
      "Official project or vendor icon resolved from a first-party source.",
    url,
  };
}

function legacyIcon(iconName: string, url: string): CuratedIconCandidate {
  return {
    iconName,
    source: "legacy",
    sourceNote:
      "Historical or classic logo asset selected for stronger product recognition.",
    url,
  };
}

function awsIcon(iconName: string, iconPath: string): CuratedIconCandidate {
  return officialIcon(
    iconName,
    `https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/main/dist/${iconPath}`,
  );
}

function simpleIcon(
  iconName: string,
  slug = iconName,
  color?: string,
): CuratedIconCandidate {
  const colorPath = color ? `/${color.replace(/^#/, "")}` : "";

  return {
    iconName,
    licenseNote:
      "Simple Icons SVG under CC0; trademarks remain with their owners.",
    source: "web-sourced",
    sourceNote:
      "Simple Icons CDN SVG; validated by the sync script before use.",
    url: `https://cdn.simpleicons.org/${slug}${colorPath}`,
  };
}

function deviconIcon(
  iconName: string,
  variant = "original",
): CuratedIconCandidate {
  return {
    iconName,
    source: "devicon",
    sourceNote:
      "Devicon ecosystem icon; source-traced but not treated as first-party brand provenance.",
    url: `https://raw.githubusercontent.com/devicons/devicon/master/icons/${iconName}/${iconName}-${variant}.svg`,
  };
}

function openMojiIcon(
  iconName: string,
  codepoint: string,
): CuratedIconCandidate {
  return {
    iconName,
    licenseNote:
      "Curated OpenMoji SVG under CC BY-SA 4.0; used only as an explicit unique concept icon.",
    source: "custom",
    sourceNote:
      "Explicit curated concept icon, not a generic category fallback.",
    url: `https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg/${codepoint}.svg`,
  };
}

async function readJsonFile(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function getVisibleSkills(siteVariant: SiteVariant): VisibleSkill[] {
  return siteVariant.skills.flatMap((group) =>
    group.keywords.map((skillName) => ({ category: group.name, skillName })),
  );
}

function slugify(skillName: string): string {
  return (
    skillName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "skill"
  );
}

function sourceCounts(
  manifest: IconManifest,
): Record<IconSource["source"], number> {
  const counts = Object.fromEntries(
    iconSourceSchema.options.map((source) => [source, 0]),
  ) as Record<IconSource["source"], number>;

  for (const entry of Object.values(manifest)) {
    counts[entry.source] += 1;
  }

  return counts;
}

function isGenericOfficialIconHost(officialUrl: string): boolean {
  const hostname = new URL(officialUrl).hostname.replace(/^www\./, "");

  return (
    hostname === "github.com" ||
    hostname === "arxiv.org" ||
    hostname.endsWith(".readthedocs.io")
  );
}

function iconExtension(
  url: string,
  contentType: string,
  bytes: Buffer,
): string | undefined {
  const normalizedContentType = contentType.split(";")[0]?.trim().toLowerCase();
  const pathname = new URL(url).pathname.toLowerCase();
  const prefix = bytes
    .subarray(0, 256)
    .toString("utf8")
    .trimStart()
    .toLowerCase();
  const isPng =
    bytes
      .subarray(0, 8)
      .compare(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ) === 0;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP";
  const isIco =
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    (bytes[2] === 0x01 || bytes[2] === 0x02) &&
    bytes[3] === 0x00;

  if (prefix.startsWith("<!doctype") || prefix.startsWith("<html")) {
    return undefined;
  }

  if (prefix.startsWith("<svg") || prefix.startsWith("<?xml")) return "svg";
  if (isPng) return "png";
  if (isWebp) return "webp";
  if (isJpeg) return "jpg";
  if (isIco) return "ico";

  if (normalizedContentType === "image/svg+xml" || pathname.endsWith(".svg")) {
    return prefix.startsWith("<svg") || prefix.startsWith("<?xml")
      ? "svg"
      : undefined;
  }

  if (normalizedContentType === "image/png" || pathname.endsWith(".png")) {
    return "png";
  }

  if (normalizedContentType === "image/webp" || pathname.endsWith(".webp")) {
    return "webp";
  }

  if (
    normalizedContentType === "image/jpeg" ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg")
  ) {
    return "jpg";
  }

  if (
    normalizedContentType === "image/x-icon" ||
    normalizedContentType === "image/vnd.microsoft.icon" ||
    pathname.endsWith(".ico")
  ) {
    return "ico";
  }

  return undefined;
}

function assertSafeSvg(bytes: Buffer, sourceUrl: string): void {
  const svg = bytes.toString("utf8");

  const unsafePatterns: Array<[RegExp, string]> = [
    [/<\s*script\b/i, "script tag"],
    [/\son[a-z0-9_-]+\s*=/i, "event handler attribute"],
    [/<\s*foreignObject\b/i, "foreignObject tag"],
    [
      /\b(?:href|src|xlink:href)\s*=\s*(["'])\s*(?:https?:|\/\/|javascript:|data:)/i,
      "unsafe href/src",
    ],
    [/<!\s*(?:doctype|entity|notation|\[CDATA\[)/i, "unsafe XML construct"],
    [/<\?(?!xml(?:\s|\?>))/i, "unsafe processing instruction"],
    [
      /@import\b|url\(\s*(["'])?\s*(?:https?:|\/\/|javascript:|data:)/i,
      "unsafe CSS reference",
    ],
  ];

  for (const [pattern, reason] of unsafePatterns) {
    if (pattern.test(svg)) {
      throw new Error(`Rejected unsafe SVG from ${sourceUrl}: ${reason}`);
    }
  }
}

function validateIconBytes(icon: DownloadedIcon): void {
  if (icon.extension === "svg") {
    assertSafeSvg(icon.bytes, icon.sourceUrl);
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), requestTimeoutMs);

  try {
    return await fetch(url, { ...init, signal: abortController.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchHtml(url: string): Promise<string | undefined> {
  const response = await fetchWithTimeout(url, {
    headers: { Accept: "text/html,application/xhtml+xml" },
  }).catch(() => undefined);

  if (!response?.ok) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  return contentType.includes("text/html") ? response.text() : undefined;
}

async function fetchIcon(
  url: string,
): Promise<{ bytes: Buffer; extension: string } | undefined> {
  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8",
    },
  }).catch(() => undefined);

  if (!response?.ok) {
    return undefined;
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.length < 16) {
    return undefined;
  }

  const extension = iconExtension(
    url,
    response.headers.get("content-type") ?? "",
    bytes,
  );

  return extension ? { bytes, extension } : undefined;
}

function getAttribute(tag: string, attribute: string): string | undefined {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*(["'])(.*?)\\1`, "i"),
  );

  return match?.[2];
}

type IconUrlCandidate = { source: IconSource["source"]; url: string };

function isFaviconUrl(url: string): boolean {
  const pathname = new URL(url).pathname.toLowerCase();

  return (
    pathname.includes("favicon") ||
    pathname.includes("apple-touch-icon") ||
    pathname.endsWith("/icon.svg")
  );
}

function declaredIconUrls(
  html: string | undefined,
  pageUrl: string,
  source: IconSource["source"],
): IconUrlCandidate[] {
  if (!html) {
    return [];
  }

  const tags = Array.from(html.matchAll(/<link\b[^>]*>/gi)).map(([tag]) => tag);

  return tags.flatMap((tag) => {
    const rel = getAttribute(tag, "rel")?.toLowerCase();
    const href = getAttribute(tag, "href");

    if (!rel?.includes("icon") || !href || href.startsWith("data:")) {
      return [];
    }

    const url = new URL(href, pageUrl).href;

    return [{ source: isFaviconUrl(url) ? "favicon" : source, url }];
  });
}

function dedupeIconCandidates(
  candidates: IconUrlCandidate[],
): IconUrlCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    if (seen.has(candidate.url)) {
      return false;
    }

    seen.add(candidate.url);

    return true;
  });
}

async function* resolveOfficialIconOverrides(
  skillName: string,
): AsyncGenerator<DownloadedIcon> {
  for (const sourceUrl of officialIconOverrides[skillName] ?? []) {
    const icon = await fetchIcon(sourceUrl);

    if (icon) {
      yield { ...icon, source: "official", sourceUrl };
    }
  }
}

async function* resolveLinkedIcons(
  links: SkillDetails[string]["links"] | undefined,
  preferredSource: "official" | "web-sourced",
): AsyncGenerator<DownloadedIcon> {
  for (const link of links ?? []) {
    const isOfficialLink = /\b(official|product|site)\b/i.test(link.label);

    if (preferredSource === "official" && !isOfficialLink) {
      continue;
    }

    if (preferredSource === "web-sourced" && isOfficialLink) {
      continue;
    }

    if (
      preferredSource === "official" &&
      isGenericOfficialIconHost(link.href)
    ) {
      continue;
    }

    const html = await fetchHtml(link.href);
    const candidates = dedupeIconCandidates([
      ...declaredIconUrls(html, link.href, preferredSource),
      { source: "favicon", url: new URL("/favicon.ico", link.href).href },
    ]);

    for (const candidate of candidates) {
      const icon = await fetchIcon(candidate.url);

      if (icon) {
        yield { ...icon, source: candidate.source, sourceUrl: candidate.url };
      }
    }
  }
}

async function* resolveIconCandidateList(
  candidates: CuratedIconCandidate[],
): AsyncGenerator<DownloadedIcon> {
  for (const candidate of candidates) {
    const icon = await fetchIcon(candidate.url);

    if (icon) {
      yield {
        ...icon,
        iconName: candidate.iconName,
        licenseNote: candidate.licenseNote,
        source: candidate.source,
        sourceNote: candidate.sourceNote,
        sourceUrl: candidate.url,
      };
    }
  }
}

async function* resolveOriginalLogoCandidates(
  skillName: string,
): AsyncGenerator<DownloadedIcon> {
  yield* resolveIconCandidateList(originalLogoCandidates[skillName] ?? []);
}

async function* resolveCuratedIcons(
  skillName: string,
): AsyncGenerator<DownloadedIcon> {
  yield* resolveIconCandidateList(curatedIconCandidates[skillName] ?? []);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function customIconSourceUrl(
  skillName: string,
  skillDetail: SkillDetails[string] | undefined,
): string {
  return (
    skillDetail?.links[0]?.href ??
    `https://w4w.dev/resume#${slugify(skillName)}`
  );
}

function createCustomIcon(
  skillName: string,
  category: string,
  skillDetail: SkillDetails[string] | undefined,
): DownloadedIcon {
  const digest = createHash("sha256")
    .update(`${category}:${skillName}`)
    .digest("hex");
  const hue = Number.parseInt(digest.slice(0, 6), 16) % 360;
  const initials =
    skillName
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${escapeXml(skillName)} icon"><title>${escapeXml(skillName)}</title><rect width="64" height="64" rx="16" fill="hsl(${hue} 72% 34%)"/><path d="M14 46V18h36v28H14Zm4-4h28V22H18v20Z" fill="hsl(${hue} 72% 88%)" opacity="0.36"/><text x="32" y="38" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="white">${escapeXml(initials)}</text></svg>`;

  return {
    bytes: Buffer.from(svg),
    extension: "svg",
    iconName: slugify(skillName),
    source: "custom",
    sourceNote:
      "Generated unique custom SVG because no safe unique brand, favicon, legacy, or source-traced icon was resolved.",
    sourceUrl: customIconSourceUrl(skillName, skillDetail),
  };
}

async function* resolveIconCandidates(
  skillName: string,
  category: string,
  skillDetails: SkillDetails,
): AsyncGenerator<DownloadedIcon> {
  const skillDetail = skillDetails[skillName];

  yield* resolveOriginalLogoCandidates(skillName);
  yield* resolveOfficialIconOverrides(skillName);
  yield* resolveLinkedIcons(skillDetail?.links, "official");
  yield* resolveCuratedIcons(skillName);
  yield* resolveLinkedIcons(skillDetail?.links, "web-sourced");
  yield createCustomIcon(skillName, category, skillDetail);
}

function validateManifest(
  manifest: IconManifest,
  visibleSkills: VisibleSkill[],
): void {
  const iconPaths = new Map<string, string>();
  const hashes = new Map<string, string>();

  for (const { skillName } of visibleSkills) {
    const entry = manifest[skillName];

    if (!entry) {
      throw new Error(
        `Missing icon manifest entry for visible skill ${skillName}`,
      );
    }

    if (!entry.sourceUrl) {
      throw new Error(`Missing sourceUrl for ${skillName}`);
    }

    const existingPathSkill = iconPaths.get(entry.iconPath);

    if (existingPathSkill) {
      throw new Error(
        `Duplicate icon path ${entry.iconPath} for ${existingPathSkill} and ${skillName}`,
      );
    }

    iconPaths.set(entry.iconPath, skillName);

    const existingHashSkill = hashes.get(entry.sha256);

    if (existingHashSkill) {
      throw new Error(
        `Duplicate icon content hash ${entry.sha256} for ${existingHashSkill} and ${skillName}`,
      );
    }

    hashes.set(entry.sha256, skillName);
  }
}

async function buildManifest(
  visibleSkills: VisibleSkill[],
  skillDetails: SkillDetails,
): Promise<IconManifest> {
  const manifest: IconManifest = {};
  const usedHashes = new Map<string, string>();
  const usedPaths = new Map<string, string>();

  for (const { category, skillName } of visibleSkills) {
    let resolved = false;

    for await (const icon of resolveIconCandidates(
      skillName,
      category,
      skillDetails,
    )) {
      validateIconBytes(icon);

      const sha256 = createHash("sha256").update(icon.bytes).digest("hex");
      const iconPath = `/skill-icons/${slugify(skillName)}.${icon.extension}`;
      const duplicatePathSkill = usedPaths.get(iconPath);

      if (duplicatePathSkill) {
        throw new Error(
          `Duplicate icon path ${iconPath} for ${duplicatePathSkill} and ${skillName}`,
        );
      }

      if (usedHashes.has(sha256)) {
        continue;
      }

      await writeFile(
        path.join(tempIconOutputDir, path.basename(iconPath)),
        icon.bytes,
      );
      usedHashes.set(sha256, skillName);
      usedPaths.set(iconPath, skillName);

      manifest[skillName] = {
        category,
        iconName: icon.iconName,
        iconPath,
        licenseNote: icon.licenseNote,
        sha256,
        source: icon.source,
        sourceNote: icon.sourceNote,
        sourceUrl: icon.sourceUrl,
      };

      resolved = true;
      break;
    }

    if (!resolved) {
      throw new Error(`Unable to resolve a unique safe icon for ${skillName}`);
    }
  }

  validateManifest(manifest, visibleSkills);

  return manifest;
}

async function syncSkillIcons() {
  const siteVariant = siteVariantSchema.parse(
    await readJsonFile(siteVariantPath),
  );
  const skillDetails = skillDetailsSchema.parse(
    await readJsonFile(skillDetailsPath),
  );
  const visibleSkills = getVisibleSkills(siteVariant);

  await rm(tempIconOutputDir, { force: true, recursive: true });
  await mkdir(tempIconOutputDir, { recursive: true });

  try {
    const manifest = await buildManifest(visibleSkills, skillDetails);
    const parsedManifest = iconManifestSchema.parse(manifest);

    await rm(iconOutputDir, { force: true, recursive: true });
    await rename(tempIconOutputDir, iconOutputDir);
    await writeFile(
      manifestPath,
      `${JSON.stringify(parsedManifest, null, 2)}\n`,
    );

    console.log(
      `Synced ${Object.keys(parsedManifest).length} skill icons: ${JSON.stringify(sourceCounts(parsedManifest))}`,
    );
  } catch (error) {
    await rm(tempIconOutputDir, { force: true, recursive: true });
    throw error;
  }
}

syncSkillIcons().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
