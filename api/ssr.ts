// This file is based on the official Vike + Vercel example:
// https://github.com/brillout/vike-with-vercel/blob/main/api/ssr.js

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPage } from 'vike/server';

const blockedProductionPaths = new Set(['/full', '/single']);

function normalizePath(url: string | undefined) {
  const pathname = new URL(url ?? '/', 'https://resume.w4w.dev').pathname;
  const normalized = pathname.replace(/\/+$/, '');
  return normalized === '' ? '/' : normalized;
}

function isBlockedProductionPath(url: string | undefined) {
  if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production') {
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
    urlOriginal: req.url,
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
