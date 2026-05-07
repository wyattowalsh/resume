// This file is based on the official Vike + Vercel example:
// https://github.com/brillout/vike-with-vercel/blob/main/api/ssr.js

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPage } from 'vike/server';

const blockedProductionPaths = new Set(['/full', '/single']);

type ProductionRouteEnvironment = {
  VERCEL?: string;
  VERCEL_ENV?: string;
};

export function normalizePath(url: string | undefined) {
  let pathname = new URL(url ?? '/', 'https://resume.w4w.dev').pathname;

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep the parsed pathname when malformed escapes cannot be decoded.
  }

  const normalized = pathname.replace(/\/+$/, '');
  return normalized === '' ? '/' : normalized;
}

export function isBlockedProductionPath(
  url: string | undefined,
  env: ProductionRouteEnvironment = {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production') {
    return false;
  }

  return blockedProductionPaths.has(normalizePath(url));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (isBlockedProductionPath(req.url)) {
    res.statusCode = 404;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Not Found');
    return;
  }

  const pageContextInit = {
    urlOriginal: req.url ?? '/',
    headersOriginal: req.headers,
  };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;

  if (!httpResponse) {
    res.statusCode = 500;
    res.end('Internal Server Error');
    return;
  }

  const { body, statusCode, headers } = httpResponse;
  res.statusCode = statusCode;
  headers.forEach(([name, value]) => res.setHeader(name, value));
  res.end(body);
} 
