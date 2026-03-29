import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import puppeteer, { type Browser } from "puppeteer";

const APP_URL_OVERRIDE = process.env.APP_URL?.trim() || undefined;
const LOCAL_APP_HOST = "127.0.0.1";
const OUTPUT_DIR = path.resolve(process.cwd(), "assets", "outputs");
const SERVER_START_TIMEOUT_MS = 60_000;
const SERVER_SHUTDOWN_TIMEOUT_MS = 10_000;
const SERVER_POLL_INTERVAL_MS = 500;

interface ResumeVariant {
  route: string;
  pdfName: string;
  pngName: string;
}

interface AppServerHandle {
  appUrl: string;
  cleanup: () => Promise<void>;
}

interface CleanupManager {
  addCleanup: (cleanup: () => Promise<void>) => () => void;
  disposeHandlers: () => void;
  runCleanup: () => Promise<void>;
}

const variants: ResumeVariant[] = [
  { route: "/full", pdfName: "resume-full.pdf", pngName: "resume-full.png" },
  {
    route: "/single",
    pdfName: "resume-single.pdf",
    pngName: "resume-single.png",
  },
];

async function findAvailablePort() {
  return await new Promise<number>((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(0, LOCAL_APP_HOST, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Unable to determine a free local port."));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

async function isAppReady(appUrl: string) {
  try {
    const response = await fetch(appUrl, { redirect: "manual" });
    return response.status < 500;
  } catch {
    return false;
  }
}

function buildRouteUrl(appUrl: string, route: string) {
  const url = new URL(appUrl);
  const basePath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  const normalizedRoute = route.replace(/^\/+/, "");

  url.pathname = path.posix.join(basePath, normalizedRoute);
  return url.toString();
}

function createCleanupManager(): CleanupManager {
  const cleanupTasks = new Set<() => Promise<void>>();
  let handledTermination = false;
  let cleanupPromise: Promise<void> | undefined;

  const runCleanup = async () => {
    if (!cleanupPromise) {
      cleanupPromise = (async () => {
        const cleanupResults = await Promise.allSettled(
          Array.from(cleanupTasks.values()).reverse().map(async (cleanup) => await cleanup()),
        );

        for (const result of cleanupResults) {
          if (result.status === "rejected") {
            process.exitCode = 1;
            console.error("Cleanup failed:", result.reason);
          }
        }
      })();
    }

    await cleanupPromise;
  };

  const runCleanupAndExit = (exitCode: number, error?: unknown) => {
    if (handledTermination) {
      return;
    }

    handledTermination = true;

    if (error) {
      console.error("Fatal error during resume generation:", error);
    }

    void runCleanup()
      .finally(() => {
        disposeHandlers();
        process.exit(exitCode);
      });
  };

  const handleSigint = () => runCleanupAndExit(130);
  const handleSigterm = () => runCleanupAndExit(143);
  const handleUnhandledRejection = (error: unknown) => runCleanupAndExit(1, error);
  const handleUncaughtException = (error: Error) => runCleanupAndExit(1, error);

  const disposeHandlers = () => {
    process.off("SIGINT", handleSigint);
    process.off("SIGTERM", handleSigterm);
    process.off("unhandledRejection", handleUnhandledRejection);
    process.off("uncaughtException", handleUncaughtException);
  };

  process.once("SIGINT", handleSigint);
  process.once("SIGTERM", handleSigterm);
  process.once("unhandledRejection", handleUnhandledRejection);
  process.once("uncaughtException", handleUncaughtException);

  return {
    addCleanup: (cleanup) => {
      cleanupTasks.add(cleanup);
      return () => {
        cleanupTasks.delete(cleanup);
      };
    },
    disposeHandlers,
    runCleanup,
  };
}

function getProcessLabel(devServer: ChildProcess) {
  if (devServer.exitCode !== null) {
    return `exit code ${devServer.exitCode}`;
  }

  if (devServer.signalCode) {
    return `signal ${devServer.signalCode}`;
  }

  return "unknown state";
}

async function killProcessTree(pid: number, signal: NodeJS.Signals) {
  if (process.platform === "win32") {
    await new Promise<void>((resolve, reject) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
      });

      killer.once("error", reject);
      killer.once("exit", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`taskkill exited with code ${code ?? "unknown"}.`));
      });
    });
    return;
  }

  try {
    process.kill(-pid, signal);
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException;

    if (typedError.code !== "ESRCH") {
      throw error;
    }
  }
}

async function stopLocalAppServer(devServer: ChildProcess) {
  if (devServer.exitCode !== null || devServer.signalCode !== null) {
    return;
  }

  const pid = devServer.pid;

  if (!pid) {
    return;
  }

  console.log("Stopping local dev server...");

  const exitPromise = new Promise<void>((resolve) => {
    if (devServer.exitCode !== null || devServer.signalCode !== null) {
      resolve();
      return;
    }

    devServer.once("exit", () => resolve());
  });

  await killProcessTree(pid, "SIGTERM");

  await Promise.race([
    exitPromise,
    delay(SERVER_SHUTDOWN_TIMEOUT_MS).then(async () => {
      if (devServer.exitCode === null) {
        await killProcessTree(pid, "SIGKILL");
      }
    }),
  ]);

  if (devServer.exitCode === null) {
    await exitPromise;
  }
}

async function waitForLocalApp(appUrl: string, devServer: ChildProcess, getOutput: () => string) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SERVER_START_TIMEOUT_MS) {
    if (devServer.exitCode !== null || devServer.signalCode) {
      throw new Error(
        `Local dev server stopped before it was ready (${getProcessLabel(devServer)}).\n${getOutput()}`.trim(),
      );
    }

    if (await isAppReady(appUrl)) {
      return;
    }

    await delay(SERVER_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for local dev server at ${appUrl}.\n${getOutput()}`.trim());
}

async function waitForExternalApp(appUrl: string) {
  const healthUrl = buildRouteUrl(appUrl, "/");
  const startedAt = Date.now();

  console.log(`Waiting for APP_URL at ${healthUrl}...`);

  while (Date.now() - startedAt < SERVER_START_TIMEOUT_MS) {
    if (await isAppReady(healthUrl)) {
      return;
    }

    await delay(SERVER_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for APP_URL at ${healthUrl}.`);
}

async function startLocalAppServer(cleanupManager: CleanupManager): Promise<AppServerHandle> {
  const port = await findAvailablePort();
  const appUrl = `http://${LOCAL_APP_HOST}:${port}`;
  const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  let recentOutput = "";

  console.log(`APP_URL not set. Starting a local dev server at ${appUrl}...`);

  const devServer = spawn(
    pnpmCommand,
    ["exec", "vike", "dev", "--host", LOCAL_APP_HOST, "--port", String(port)],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    },
  );
  const devServerError = new Promise<never>((_, reject) => {
    devServer.once("error", reject);
  });
  let cleanedUp = false;
  let unregisterCleanup: () => void = () => undefined;
  const cleanupServer = async () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    unregisterCleanup();
    await stopLocalAppServer(devServer);
  };
  unregisterCleanup = cleanupManager.addCleanup(cleanupServer);

  const appendOutput = (chunk: Buffer, stream: NodeJS.WriteStream) => {
    const text = chunk.toString();
    recentOutput = `${recentOutput}${text}`.slice(-8_000);
    stream.write(text);
  };

  devServer.stdout?.on("data", (chunk: Buffer) => appendOutput(chunk, process.stdout));
  devServer.stderr?.on("data", (chunk: Buffer) => appendOutput(chunk, process.stderr));

  try {
    await Promise.race([waitForLocalApp(appUrl, devServer, () => recentOutput), devServerError]);
  } catch (error) {
    await cleanupServer();
    throw error;
  }

  console.log(`Local dev server ready at ${appUrl}.`);

  return {
    appUrl,
    cleanup: cleanupServer,
  };
}

async function resolveAppServer(cleanupManager: CleanupManager): Promise<AppServerHandle> {
  if (APP_URL_OVERRIDE) {
    const appUrl = new URL(APP_URL_OVERRIDE).toString();

    console.log(`Using APP_URL override: ${appUrl}`);
    await waitForExternalApp(appUrl);
    return {
      appUrl,
      cleanup: async () => undefined,
    };
  }

  return await startLocalAppServer(cleanupManager);
}

async function generateResume() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let appServer: AppServerHandle | undefined;
  let browser: Browser | undefined;
  let browserClosed = false;
  const cleanupManager = createCleanupManager();

  try {
    appServer = await resolveAppServer(cleanupManager);

    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    cleanupManager.addCleanup(async () => {
      if (!browser || browserClosed) {
        return;
      }

      browserClosed = true;
      console.log("Closing browser...");
      await browser.close();
    });

    for (const variant of variants) {
      const url = buildRouteUrl(appServer.appUrl, variant.route);
      const pdfPath = path.join(OUTPUT_DIR, variant.pdfName);
      const pngPath = path.join(OUTPUT_DIR, variant.pngName);

      console.log(`\nGenerating ${variant.route}...`);
      const page = await browser.newPage();

      console.log(`  Navigating to ${url}...`);
      const response = await page.goto(url, { waitUntil: "networkidle0" });

      if (!response || !response.ok()) {
        throw new Error(`Unable to load ${url} (status ${response?.status() ?? "no response"}).`);
      }

      await page.emulateMediaType("print");

      await page.evaluate(() => {
        const noPrint = document.querySelector(".no-print");
        if (noPrint) {
          (noPrint as HTMLElement).style.display = "none";
        }
      });

      console.log("  Taking screenshot...");
      await page.screenshot({ path: pngPath as `${string}.png`, fullPage: true });

      console.log("  Generating PDF...");
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
    process.exitCode = 1;
    console.error("An error occurred during resume generation:", error);
  } finally {
    cleanupManager.disposeHandlers();
    await cleanupManager.runCleanup();
  }
}

void generateResume();
