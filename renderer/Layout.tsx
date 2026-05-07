import React from 'react';
import '@/index.css';
import { ThemeProvider } from '@/components/theme-provider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ModeToggle } from '@/components/theme-toggle';
import { HelmetProvider } from 'react-helmet-async';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="theme"
          >
            <a
              href="#page-content"
              className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Skip to content
            </a>
            <div className="fixed top-4 right-4 z-50 no-print">
              <ModeToggle />
            </div>
            <div vaul-drawer-wrapper="" className="bg-background min-h-screen">
              <div id="page-content" tabIndex={-1}>
                {children}
              </div>
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>
  );
}
