import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. This has been logged and we're working on a fix.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-3 rounded-lg bg-muted p-3 text-left text-xs text-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2.5 text-sm font-bold text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
              <a href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition-colors no-underline"
              >
                <Home className="h-4 w-4" /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
