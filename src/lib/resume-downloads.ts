type ResumeDownloadVariant = "single" | "full";
type ResumeDownloadFormat = "pdf" | "docx";

type ResumeDownloadDefinition = {
  variant: ResumeDownloadVariant;
  format: ResumeDownloadFormat;
  href: string;
  variantLabel: string;
  formatLabel: string;
  fullLabel: string;
  ariaLabel: string;
};

const resumeDownloadDefinitions: ResumeDownloadDefinition[] = [
  {
    variant: "single",
    format: "pdf",
    href: "/downloads/wyatt-walsh-resume-single.pdf",
    variantLabel: "1-page",
    formatLabel: "PDF",
    fullLabel: "1-page PDF",
    ariaLabel: "Open or download the 1-page resume PDF",
  },
  {
    variant: "single",
    format: "docx",
    href: "/downloads/wyatt-walsh-resume-single.docx",
    variantLabel: "1-page",
    formatLabel: "DOCX",
    fullLabel: "1-page DOCX",
    ariaLabel: "Download the 1-page resume DOCX",
  },
  {
    variant: "full",
    format: "pdf",
    href: "/downloads/wyatt-walsh-resume-full.pdf",
    variantLabel: "2-page",
    formatLabel: "PDF",
    fullLabel: "2-page PDF",
    ariaLabel: "Open or download the 2-page resume PDF",
  },
  {
    variant: "full",
    format: "docx",
    href: "/downloads/wyatt-walsh-resume-full.docx",
    variantLabel: "2-page",
    formatLabel: "DOCX",
    fullLabel: "2-page DOCX",
    ariaLabel: "Download the 2-page resume DOCX",
  },
];

export const resumeDownloads = resumeDownloadDefinitions.map((download) => ({
  href: download.href,
  label: download.fullLabel,
  ariaLabel: download.ariaLabel,
}));

export const resumeDownloadGroups = (["single", "full"] as const).map((variant) => {
  const downloads = resumeDownloadDefinitions.filter(
    (download) => download.variant === variant,
  );

  return {
    label: downloads[0]?.variantLabel ?? variant,
    links: downloads.map((download) => ({
      href: download.href,
      label: download.formatLabel,
      ariaLabel: download.ariaLabel,
    })),
  };
});
