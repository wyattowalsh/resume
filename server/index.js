import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage } from "vike/server";

const defaultHost = "127.0.0.1";
const defaultPort = 4173;

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot     = path.resolve(serverDirectory, "..");
const distDirectory   = path.join(projectRoot, "dist");
const clientDirectory = path.join(distDirectory, "client");
const publicDirectory = path.join(projectRoot, "public");

function getArgumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function getPort() {
  const rawPort = getArgumentValue("--port") ?? process.env.PORT;
  if (!rawPort) {
    return defaultPort;
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${rawPort}`);
  }

  return port;
}

function getHost() {
  return getArgumentValue("--host") ?? process.env.HOST ?? defaultHost;
}

const app = express();

function isDirectRun() {
  const scriptPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
  return scriptPath === serverDirectory || scriptPath === fileURLToPath(import.meta.url);
}

app.use(express.static(clientDirectory));
app.use(express.static(distDirectory));
app.use(express.static(publicDirectory));

app.get("*splat", async (req, res, next) => {
  try {
    const pageContext = await renderPage({
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers,
    });
    const { httpResponse } = pageContext;

    if (!httpResponse) {
      res.status(404).send("Not Found");
      return;
    }

    const { body, statusCode, headers } = httpResponse;
    headers.forEach(([name, value]) => res.setHeader(name, value));
    res.status(statusCode).send(body);
  } catch (error) {
    next(error);
  }
});

if (isDirectRun()) {
  const host = getHost();
  const port = getPort();

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

export default app;
