const ACRONYMS = new Set(["ai", "llm", "mcp"]);

export function formatThemeLabel(theme: string) {
  return theme
    .split("-")
    .map((segment) => {
      const normalized = segment.toLowerCase();

      if (ACRONYMS.has(normalized)) {
        return normalized.toUpperCase();
      }

      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" ");
}
