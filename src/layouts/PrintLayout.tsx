import React from "react";
import "@/index.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <div className="bg-background min-h-screen">
            <div>{children}</div>
          </div>
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>
  );
}
