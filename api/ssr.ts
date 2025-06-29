// This file is based on the official Vike + Vercel example:
// https://github.com/brillout/vike-with-vercel/blob/main/api/ssr.js

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPage } from 'vike/server';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
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