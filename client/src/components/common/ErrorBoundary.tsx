import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-line shadow-soft space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-[#FBF0EA] border border-[#F4DACB] text-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-normal text-ink">Something went wrong</h2>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                An unexpected interface error occurred while rendering this page.
              </p>
              {this.state.error?.message && (
                <p className="text-[11px] font-mono text-danger/80 bg-canvas p-2.5 rounded-xl border border-line mt-3 text-left overflow-x-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink text-surface text-xs font-medium hover:bg-ink/90 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reload Page
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-line text-xs font-medium text-ink hover:bg-canvas transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
