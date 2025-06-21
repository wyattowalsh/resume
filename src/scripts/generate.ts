import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const APP_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(process.cwd(), 'assets', 'outputs');
const PDF_PATH = path.join(OUTPUT_DIR, 'resume.pdf');
const PNG_PATH = path.join(OUTPUT_DIR, 'resume.png');

async function generateResume() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    console.log(`Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, {
      waitUntil: 'networkidle0',
    });

    // Emulate print media type
    await page.emulateMediaType('print');

    // Hide the theme toggle
    await page.evaluate(() => {
      const themeToggle = document.querySelector('.no-print');
      if (themeToggle) {
        (themeToggle as HTMLElement).style.display = 'none';
      }
    });

    console.log('Taking a screenshot...');
    await page.screenshot({ path: PNG_PATH as `${string}.png`, fullPage: true });

    console.log('Generating PDF...');
    await page.pdf({
      path: PDF_PATH,
      printBackground: true,
      width: '1200px',
    });

    console.log('✅ Resume generation complete!');
  } catch (error) {
    console.error('An error occurred during resume generation:', error);
    process.exit(1);
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}

generateResume();