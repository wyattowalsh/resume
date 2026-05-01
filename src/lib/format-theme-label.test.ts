import { describe, expect, it } from "vitest";
import { formatThemeLabel } from "./format-theme-label";

describe("formatThemeLabel", () => {
  it("formats theme slugs while preserving known acronyms", () => {
    expect(formatThemeLabel("agentic-ai")).toBe("Agentic AI");
    expect(formatThemeLabel("llm-applications")).toBe("LLM Applications");
    expect(formatThemeLabel("mcp-server")).toBe("MCP Server");
    expect(formatThemeLabel("data-platforms")).toBe("Data Platforms");
  });
});
