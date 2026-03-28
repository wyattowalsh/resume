import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const APP_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "assets", "outputs");

const variants = [
  { route: "/full", pdfName: "resume-full.pdf", pngName: "resume-full.png" },
  {
    route: "/single",
    pdfName: "resume-single.pdf",
    pngName: "resume-single.png",
  },
];

async function generateResume() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const variant of variants) {
      const url = `${APP_URL}${variant.route}`;
      const pdfPath = path.join(OUTPUT_DIR, variant.pdfName);
      const pngPath = path.join(OUTPUT_DIR, variant.pngName);

      console.log(`\nGenerating ${variant.route}...`);
      const page = await browser.newPage();

      console.log(`  Navigating to ${url}...`);
      await page.goto(url, { waitUntil: "networkidle0" });

      await page.emulateMediaType("print");

      // Hide any elements not meant for print
      await page.evaluate(() => {
        const noPrint = document.querySelector(".no-print");
        if (noPrint) {
          (noPrint as HTMLElement).style.display = "none";
        }
      });

      console.log(`  Taking screenshot...`);
      await page.screenshot({ path: pngPath as `${string}.png`, fullPage: true });

      console.log(`  Generating PDF...`);
      await page.pdf({
        path: pdfPath,
        printBackground: true,
        format: "Letter",
        preferCSSPageSize: true,
        scale: 0.98,
      });

      await page.close();
      console.log(`  -> ${variant.pdfName}, ${variant.pngName}`);
    }

    console.log("\nResume generation complete!");
  } catch (error) {
    console.error("An error occurred during resume generation:", error);
    process.exit(1);
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}

generateResume();
