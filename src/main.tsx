import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { ModeToggle } from "./components/theme-toggle.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ErrorBoundary>
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<div className="fixed top-4 right-4 z-50 no-print">
					<ModeToggle />
				</div>
				<App />
			</ThemeProvider>
		</ErrorBoundary>
	</React.StrictMode>
);
