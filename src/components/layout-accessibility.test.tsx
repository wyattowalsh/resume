import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Layout from "../../renderer/Layout";
import PrintLayout from "../layouts/PrintLayout";

describe("layout accessibility landmarks", () => {
  it("keeps PrintLayout from adding a nested main landmark", () => {
    const markup = renderToStaticMarkup(
      <PrintLayout>
        <main>Printable resume</main>
      </PrintLayout>,
    );

    expect(markup.match(/<main/g)).toHaveLength(1);
  });

  it("makes the skip-link target programmatically focusable", () => {
    const markup = renderToStaticMarkup(
      <Layout>
        <main>Interactive resume</main>
      </Layout>,
    );

    expect(markup).toContain('id="page-content"');
    expect(markup).toContain('tabindex="-1"');
  });
});
