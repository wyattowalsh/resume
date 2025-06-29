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
            <div className="fixed top-4 right-4 z-50 no-print">
              <ModeToggle />
            </div>
            <div vaul-drawer-wrapper="" className="bg-background min-h-screen">
              <main>{children}</main>
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>
  );
} 