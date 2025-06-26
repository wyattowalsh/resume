import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-red-50 text-red-800">
          <div className="max-w-2xl rounded-lg border-2 border-dashed border-red-300 bg-white p-8 text-center shadow-lg">
            <h1 className="mb-4 text-3xl font-bold">Something went wrong.</h1>
            <p className="mb-6 text-lg">
              We're sorry, but the application encountered an unexpected error. Please try refreshing the page.
            </p>
            <details className="text-left">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-red-100 p-4 text-sm font-mono">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 